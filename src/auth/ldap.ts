import { Client } from "ldapts";

function getAttrString(
  entry: Record<string, unknown>,
  attr: string
): string | undefined {
  const val = entry[attr];
  if (typeof val === "string") return val;
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
    return val[0] as string;
  }
  return undefined;
}

export async function ldapAuthenticate(
  username: string,
  password: string
): Promise<boolean> {
  const url = process.env.LDAP_URL;
  const domain = process.env.LDAP_DOMAIN;

  if (!url || !domain) {
    console.error(
      "LDAP_URL ou LDAP_DOMAIN não configurados nas variáveis de ambiente."
    );
    return false;
  }

  const client = new Client({ url });

  try {
    // Autenticação usando UPN: username@domain
    const upn = `${username}@${domain}`;
    await client.bind(upn, password);
    return true;
  } catch (err) {
    console.error("Falha de autenticação LDAP:", err);
    return false;
  } finally {
    try {
      await client.unbind();
    } catch {
      // noop
    }
  }
}

export async function ldapAuthenticateAndGetFullName(
  username: string,
  password: string
): Promise<{
  success: boolean;
  fullName?: string;
  attributes?: Record<string, string | undefined>;
}> {
  const url = process.env.LDAP_URL;
  const domain = process.env.LDAP_DOMAIN;
  const baseDn = process.env.LDAP_BASE_DN;

  if (!url || !domain || !baseDn) {
    console.error(
      "LDAP_URL, LDAP_DOMAIN ou LDAP_BASE_DN não configurados nas variáveis de ambiente."
    );
    return { success: false };
  }

  const client = new Client({ url });

  try {
    const upn = `${username}@${domain}`;
    await client.bind(upn, password);

    const searchFilter = `(|(sAMAccountName=${username})(userPrincipalName=${upn}))`;
    const searchOptions = {
      scope: "sub" as const,
      filter: searchFilter,
      attributes: [
        "sAMAccountName",
        "displayName",
        "givenName",
        "sn",
        "cn",
        "userPrincipalName",
      ],
    };

    const { searchEntries } = await client.search(baseDn, searchOptions);
    const entry = (searchEntries?.[0] ?? undefined) as
      | Record<string, unknown>
      | undefined;

    let fullName: string | undefined;

    if (entry) {
      const displayName = getAttrString(entry, "displayName");
      const cn = getAttrString(entry, "cn");
      const givenName = getAttrString(entry, "givenName");
      const sn = getAttrString(entry, "sn");

      if (displayName && displayName.trim().length > 0) {
        fullName = displayName;
      } else if ((givenName && givenName.trim()) || (sn && sn.trim())) {
        fullName = [givenName, sn].filter(Boolean).join(" ").trim();
      } else if (cn && cn.trim().length > 0) {
        fullName = cn;
      } else {
        fullName = getAttrString(entry, "sAMAccountName");
      }

      return {
        success: true,
        fullName,
        attributes: {
          sAMAccountName: getAttrString(entry, "sAMAccountName"),
          displayName,
          givenName,
          sn,
          cn,
          userPrincipalName: getAttrString(entry, "userPrincipalName"),
        },
      };
    }

    return { success: true, fullName: undefined, attributes: undefined };
  } catch (err) {
    console.error("Falha de autenticação/consulta LDAP:", err);
    return { success: false };
  } finally {
    try {
      await client.unbind();
    } catch {
      // noop
    }
  }
}

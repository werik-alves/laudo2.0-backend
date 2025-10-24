-- CreateTable
CREATE TABLE `InfoLaudo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroChamado` VARCHAR(191) NOT NULL,
    `tecnico` VARCHAR(191) NOT NULL,
    `equipamento` VARCHAR(191) NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `loja` VARCHAR(191) NOT NULL,
    `setor` VARCHAR(191) NOT NULL,
    `tombo` VARCHAR(191) NOT NULL,
    `data` VARCHAR(191) NOT NULL,
    `testesRealizados` VARCHAR(191) NULL,
    `diagnostico` VARCHAR(191) NULL,
    `estadoEquipamento` ENUM('FUNCIONANDO', 'NAO_FUNCIONANDO') NULL,
    `necessidade` ENUM('SUBSTITUIDO', 'ENVIAR_CONSERTO', 'DESCARTADO') NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdByUsername` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

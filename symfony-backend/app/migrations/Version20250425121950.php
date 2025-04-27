<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250425121950 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Convert completed column to boolean properly';
    }

    public function up(Schema $schema): void
{
    // 🔥 1. Eliminar el valor por defecto actual (probablemente era string '')
    $this->addSql(<<<'SQL'
        ALTER TABLE task ALTER completed DROP DEFAULT
    SQL);

    // 🔁 2. Convertir tipo con casting explícito
    $this->addSql(<<<'SQL'
        ALTER TABLE task ALTER completed TYPE BOOLEAN USING completed::BOOLEAN
    SQL);

    // ✅ 3. Asegurar que no sea nulo
    $this->addSql(<<<'SQL'
        ALTER TABLE task ALTER completed SET NOT NULL
    SQL);
}


    public function down(Schema $schema): void
    {
        $this->addSql(<<<'SQL'
            ALTER TABLE task ALTER completed TYPE VARCHAR(255)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task ALTER completed DROP NOT NULL
        SQL);
    }
}

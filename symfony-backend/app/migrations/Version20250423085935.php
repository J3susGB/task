<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250423085935 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE task ADD project_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task ADD user_id INT NOT NULL
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task ADD CONSTRAINT FK_527EDB25166D1F9C FOREIGN KEY (project_id) REFERENCES project (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task ADD CONSTRAINT FK_527EDB25A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_527EDB25166D1F9C ON task (project_id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_527EDB25A76ED395 ON task (user_id)
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            CREATE SCHEMA public
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task DROP CONSTRAINT FK_527EDB25166D1F9C
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task DROP CONSTRAINT FK_527EDB25A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_527EDB25166D1F9C
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_527EDB25A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task DROP project_id
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE task DROP user_id
        SQL);
    }
}

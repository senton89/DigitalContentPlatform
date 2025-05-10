using Microsoft.EntityFrameworkCore.Migrations;

namespace DigitalContentPlatform.Infrastructure.Data.Migrations
{
    public partial class AddIndexes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Индекс для поиска по названию и описанию цифрового контента
            migrationBuilder.CreateIndex(
                name: "IX_DigitalItems_Title",
                table: "DigitalItems",
                column: "Title");

            migrationBuilder.CreateIndex(
                name: "IX_DigitalItems_Description",
                table: "DigitalItems",
                column: "Description");

            // Индекс для фильтрации по цене
            migrationBuilder.CreateIndex(
                name: "IX_DigitalItems_Price",
                table: "DigitalItems",
                column: "Price");

            // Индекс для фильтрации по статусу
            migrationBuilder.CreateIndex(
                name: "IX_DigitalItems_Status",
                table: "DigitalItems",
                column: "Status");

            // Индекс для сортировки по дате создания
            migrationBuilder.CreateIndex(
                name: "IX_DigitalItems_CreatedAt",
                table: "DigitalItems",
                column: "CreatedAt");

            // Индекс для заказов по дате создания
            migrationBuilder.CreateIndex(
                name: "IX_Orders_CreatedAt",
                table: "Orders",
                column: "CreatedAt");

            // Индекс для пользователей по дате регистрации
            migrationBuilder.CreateIndex(
                name: "IX_Users_CreatedAt",
                table: "Users",
                column: "CreatedAt");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DigitalItems_Title",
                table: "DigitalItems");

            migrationBuilder.DropIndex(
                name: "IX_DigitalItems_Description",
                table: "DigitalItems");

            migrationBuilder.DropIndex(
                name: "IX_DigitalItems_Price",
                table: "DigitalItems");

            migrationBuilder.DropIndex(
                name: "IX_DigitalItems_Status",
                table: "DigitalItems");

            migrationBuilder.DropIndex(
                name: "IX_DigitalItems_CreatedAt",
                table: "DigitalItems");

            migrationBuilder.DropIndex(
                name: "IX_Orders_CreatedAt",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Users_CreatedAt",
                table: "Users");
        }
    }
}
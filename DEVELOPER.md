# Руководство по запуску Digital Content Platform для разработчика

## Содержание
1. [Введение](#введение)
2. [Архитектура системы](#архитектура-системы)
3. [Требования](#требования)
4. [Настройка окружения разработки](#настройка-окружения-разработки)
5. [Настройка базы данных](#настройка-базы-данных)
6. [Конфигурация приложения](#конфигурация-приложения)
7. [Запуск приложения](#запуск-приложения)
8. [Инициализация данных](#инициализация-данных)
9. [Тестирование API](#тестирование-api)
10. [Устранение неполадок](#устранение-неполадок)

## Введение

Digital Content Platform - это система для управления цифровым контентом, которая позволяет пользователям загружать, продавать и покупать различные цифровые товары. Система имеет разделение ролей (пользователь, создатель контента, администратор) и включает в себя функционал каталога, поиска, корзины покупок и административной панели.

Данное руководство предназначено для разработчиков, которые хотят запустить систему с нуля, когда база данных изначально пуста.

## Архитектура системы

Платформа построена на основе чистой архитектуры (Clean Architecture) и состоит из следующих компонентов:

### Backend
- **DigitalContentPlatform.Core**: Содержит бизнес-модели, интерфейсы и бизнес-логику
- **DigitalContentPlatform.Infrastructure**: Реализует интерфейсы из Core, работает с базой данных и внешними сервисами
- **DigitalContentPlatform.API**: Предоставляет REST API для взаимодействия с клиентом

### Frontend
- **React-приложение**: Клиентская часть, построенная на React с использованием TypeScript
- **Redux**: Управление состоянием приложения
- **React Router**: Маршрутизация
- **Axios**: HTTP-запросы к API

## Требования

Для запуска системы вам потребуется:

- .NET 7.0 SDK
- PostgreSQL 13+
- Node.js 16+ и npm (для фронтенда)
- Git

## Настройка окружения разработки

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-repo/digital-content-platform.git
cd digital-content-platform
```

### 2. Настройка Backend

#### Установка зависимостей .NET

```bash
dotnet restore
```

## Настройка базы данных

### 1. Установка PostgreSQL

Если PostgreSQL еще не установлен, установите его согласно инструкциям для вашей операционной системы:

- **Windows**: Скачайте и установите с [официального сайта](https://www.postgresql.org/download/windows/)
- **macOS**: Используйте Homebrew: `brew install postgresql`
- **Linux (Ubuntu)**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Создание базы данных

```bash
# Подключение к PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE digitalcontentdb;

# Создание пользователя (опционально)
CREATE USER dcpuser WITH ENCRYPTED PASSWORD 'your_password';

# Предоставление прав пользователю
GRANT ALL PRIVILEGES ON DATABASE digitalcontentdb TO dcpuser;

# Выход из psql
\q
```

### 3. Настройка строки подключения

Отредактируйте файл `appsettings.json` в проекте DigitalContentPlatform.API:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=digitalcontentdb;Username=postgres;Password=your_password"
  },
  // Другие настройки...
}
```

## Конфигурация приложения

### 1. Настройка JWT для аутентификации

В файле `appsettings.json` настройте параметры JWT:

```json
{
  "JWT": {
    "Secret": "your_very_long_secret_key_at_least_32_characters",
    "Issuer": "DigitalContentPlatform",
    "Audience": "DigitalContentPlatformUsers",
    "ExpiryMinutes": 60
  }
}
```

### 2. Настройка хранения файлов

Добавьте в `appsettings.json` настройки для хранения файлов:

```json
{
  "FileStorage": {
    "BasePath": "C:\\DigitalContentPlatform\\Files",
    "AllowedExtensions": [".jpg", ".jpeg", ".png", ".pdf", ".zip", ".mp3", ".mp4"]
  }
}
```

Убедитесь, что указанная директория существует и у приложения есть права на запись в неё.

## Запуск приложения

### 1. Применение миграций базы данных

```bash
cd DigitalContentPlatform.API
dotnet ef database update
```

Если команда не работает, установите инструменты Entity Framework Core:

```bash
dotnet tool install --global dotnet-ef
```

### 2. Запуск API

```bash
dotnet run
```

По умолчанию API будет доступен по адресу: `https://localhost:5001` или `http://localhost:5000`

## Инициализация данных

При первом запуске система автоматически инициализирует базу данных с помощью класса `DbInitializer`. Он создаст:

1. Базовые категории контента:
   - E-books
   - Audio
   - Video
   - Software

2. Учетную запись администратора:
   - Email: admin@example.com
   - Username: admin
   - Роль: Admin

Для ручного запуска инициализации (если это необходимо):

```csharp
// В Program.cs или Startup.cs добавьте:
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await DigitalContentPlatform.Infrastructure.Data.DbInitializer.InitializeAsync(services);
        logger.LogInformation("Database initialized successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while initializing the database.");
    }
}
```

## Тестирование API

После запуска API вы можете протестировать его с помощью Swagger UI, который доступен по адресу:

```
https://localhost:5001/api-docs
```

### Основные шаги для тестирования:

1. **Регистрация пользователя**:
   - Используйте эндпоинт `POST /api/Auth/register`
   - Пример тела запроса:
     ```json
     {
       "username": "testuser",
       "email": "test@example.com",
       "password": "Password123!",
       "confirmPassword": "Password123!"
     }
     ```

2. **Аутентификация**:
   - Используйте эндпоинт `POST /api/Auth/login`
   - Пример тела запроса:
     ```json
     {
       "email": "test@example.com",
       "password": "Password123!"
     }
     ```
   - Сохраните полученный JWT токен

3. **Авторизация в Swagger**:
   - Нажмите кнопку "Authorize" в верхней части Swagger UI
   - Введите токен в формате: `Bearer your_jwt_token`
   - Нажмите "Authorize"

4. **Создание цифрового контента**:
   - Используйте эндпоинт `POST /api/DigitalItems`
   - Заполните форму с данными о контенте и загрузите файлы

5. **Просмотр каталога**:
   - Используйте эндпоинт `GET /api/DigitalItems`

6. **Административные функции** (требуется роль Admin):
   - Используйте эндпоинты в разделе `/api/Admin`

## Устранение неполадок

### Проблемы с миграциями

Если возникают проблемы с миграциями, попробуйте удалить и создать их заново:

```bash
# Удаление всех миграций
dotnet ef migrations remove

# Создание новой миграции
dotnet ef migrations add InitialCreate

# Применение миграции
dotnet ef database update
```

### Проблемы с аутентификацией

1. Убедитесь, что секретный ключ JWT достаточно длинный (минимум 32 символа)
2. Проверьте, что токен передается в заголовке Authorization в формате: `Bearer your_jwt_token`
3. Проверьте срок действия токена (по умолчанию 60 минут)

### Проблемы с загрузкой файлов

1. Убедитесь, что директория для хранения файлов существует и доступна для записи
2. Проверьте, что загружаемые файлы имеют разрешенные расширения
3. Проверьте максимальный размер загружаемых файлов в конфигурации

### Логирование

Для более подробной диагностики проблем включите расширенное логирование в `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}
```

Это позволит видеть SQL-запросы и другую полезную информацию в консоли при запуске приложения.

---

Следуя этому руководству, вы сможете успешно запустить Digital Content Platform с нуля и начать работу с системой. Если у вас возникнут дополнительные вопросы или проблемы, обратитесь к документации или создайте issue в репозитории проекта.
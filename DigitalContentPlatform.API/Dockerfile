FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["DigitalContentPlatform.API/DigitalContentPlatform.API.csproj", "DigitalContentPlatform.API/"]
COPY ["DigitalContentPlatform.Core/DigitalContentPlatform.Core.csproj", "DigitalContentPlatform.Core/"]
COPY ["DigitalContentPlatform.Infrastructure/DigitalContentPlatform.Infrastructure.csproj", "DigitalContentPlatform.Infrastructure/"]
RUN dotnet restore "DigitalContentPlatform.API/DigitalContentPlatform.API.csproj"
COPY . .
WORKDIR "/src/DigitalContentPlatform.API"
RUN dotnet build "DigitalContentPlatform.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "DigitalContentPlatform.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Создаем директорию для загружаемых файлов
RUN mkdir -p /app/wwwroot/uploads/items
RUN mkdir -p /app/wwwroot/uploads/thumbnails
# Устанавливаем права на директории
RUN chmod -R 777 /app/wwwroot/uploads
ENTRYPOINT ["dotnet", "DigitalContentPlatform.API.dll"]

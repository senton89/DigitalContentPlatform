using System.Reflection;
using DigitalContentPlatform.API.Validators;
using DigitalContentPlatform.Core.Interfaces.Repositories;
using DigitalContentPlatform.Core.Interfaces.Services;
using DigitalContentPlatform.Infrastructure.Data;
using DigitalContentPlatform.Infrastructure.Repositories;
using DigitalContentPlatform.Infrastructure.Services;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using DigitalContentPlatform.API.Profiles;
using Microsoft.Extensions.FileProviders;
using Microsoft.OpenApi.Models;

namespace DigitalContentPlatform.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection")));
            
            // Регистрация AutoMapper
            services.AddAutoMapper(typeof(MappingProfile));
            
            // Регистрация репозиториев
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IDigitalItemRepository, DigitalItemRepository>();
            services.AddScoped<ICategoryRepository, CategoryRepository>();
            services.AddScoped<ICartRepository, CartRepository>();
            services.AddScoped<ISharedContentRepository, SharedContentRepository>();

            // Регистрация кэш-сервиса
            services.AddMemoryCache();
            services.AddSingleton<ICacheService, MemoryCacheService>();
            services.AddSingleton<QueryProfilerService>();

            // Регистрация сервисов
            services.AddScoped<ITokenService,TokenService>();
            services.AddScoped<IAuthService,AuthService>();
            services.AddScoped<IDigitalItemService,DigitalItemService>();
            services.AddScoped<IFileService,FileService>();
            services.AddScoped<ISearchService,SearchService>();
            services.AddScoped<IOrderRepository, OrderRepository>();
            services.AddScoped<ICategoryService, CategoryService>();
            services.AddScoped<ICartService, CartService>();
            services.AddScoped<IFileService, CloudinaryService>();
            services.AddScoped<ISharedContentService, SharedContentService>();
            // services.AddScoped<IFileService, LocalStorageService>();
            
             // Декорирование репозиториев кэширующими декораторами
            services.Decorate<IDigitalItemRepository, CachedDigitalItemRepository>();
            services.Decorate<ICategoryRepository, CachedCategoryRepository>();

            // Регистрация административных сервисов
            services.AddScoped<IUserManagementService, UserManagementService>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();
            
            // Настройка FluentValidation
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                })
                .AddFluentValidation(fv =>
                {
                    fv.RegisterValidatorsFromAssemblyContaining<DigitalContentPlatform.API.Validators.RegisterDtoValidator>();
                });

            // Настройка аутентификации
            services.AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(Configuration["JWT:Secret"])),
                        ValidateIssuer = true,
                        ValidIssuer = Configuration["JWT:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = Configuration["JWT:Audience"],
                        ValidateLifetime = true
                    };
                });

            // Настройка CORS
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", policy =>
                {
                    policy.AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowAnyOrigin();
                    //.WithOrigins("http://localhost:3000");
                });
            });
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
                    options.JsonSerializerOptions.MaxDepth = 64; // Increase from default 32 if needed
                });

            services.AddHealthChecks();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Digital Content Platform API",
                    Version = "v1",
                    Description = "API для платформы управления цифровым контентом",
                    Contact = new OpenApiContact
                    {
                        Name = "API Support",
                        Email = "support@digitalcontentplatform.com"
                    }
                });
        
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });
        
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
        
                // Включение XML-комментариев
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                if (File.Exists(xmlPath))
                {
                    c.IncludeXmlComments(xmlPath);
                }
            });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Digital Content Platform API v1");
                    c.RoutePrefix = "swagger";
                    c.DocumentTitle = "Digital Content Platform API Documentation";
                    c.DefaultModelsExpandDepth(-1); // Скрыть раздел моделей
                });
            }

            app.UseCors("CorsPolicy");
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            // app.UseStaticFiles(new StaticFileOptions
            // {
            //     FileProvider = new PhysicalFileProvider(
            //         Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")),
            //     RequestPath = "/static"
            // });
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHealthChecks("/health");
            });
        }
    }
}
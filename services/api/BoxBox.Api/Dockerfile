FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY BoxBox.Domain/BoxBox.Domain.csproj BoxBox.Domain/
COPY BoxBox.Application/BoxBox.Application.csproj BoxBox.Application/
COPY BoxBox.Infrastructure/BoxBox.Infrastructure.csproj BoxBox.Infrastructure/
COPY BoxBox.Api/BoxBox.Api.csproj BoxBox.Api/
RUN dotnet restore BoxBox.Api/BoxBox.Api.csproj
COPY . .
RUN dotnet publish BoxBox.Api/BoxBox.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "BoxBox.Api.dll"]

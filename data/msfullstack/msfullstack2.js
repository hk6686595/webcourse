// 微软全栈开发 6–7：SignalR 与 Azure 部署
const msfs6 = {
  id: 'msfs-signalr',
  title: '6. SignalR 实时通信',
  category: '实时',
  version: '.NET 8',
  level: '进阶',
  summary: '掌握 SignalR 核心概念：Hub、连接管理、广播/组播、强类型 Hub、与 Blazor 集成构建实时应用。',
  detail: [
    'SignalR 是微软的实时通信库，基于 WebSocket（自动降级到 SSE/长轮询），实现服务器到客户端的实时推送。',
    'Hub：SignalR 的核心抽象，定义服务器可调用的方法；客户端通过 HubConnection 调用 Hub 方法。',
    '广播方式：Clients.All.SendAsync()（全体）、Clients.Group("X").SendAsync()（组）、Clients.User(userId).SendAsync()（单用户）。',
    '连接管理：OnConnectedAsync/OnDisconnectedAsync 处理连接生命周期，Context.ConnectionId 标识连接。',
    '强类型 Hub：继承 Hub<T>，使用接口定义方法，支持编译时检查和智能提示。',
    '与 Blazor 集成：Blazor 组件可直接注入 HubConnectionBuilder，构建实时聊天、通知、协作编辑等场景。',
  ],
  notes: [
    'SignalR 需要启用 CORS 和授权，生产环境建议使用 Azure SignalR Service 托管。',
    '连接状态管理：处理断线重连、连接状态显示、消息队列（离线消息）。',
  ],
  example:
    '// ChatHub.cs\n' +
    'public class ChatHub : Hub\n' +
    '{\n' +
    '    public async Task SendMessage(string user, string message)\n' +
    '    {\n' +
    '        await Clients.All.SendAsync(\n' +
    '            "ReceiveMessage", user, message);\n' +
    '    }\n\n' +
    '    public async Task JoinGroup(string group)\n' +
    '    {\n' +
    '        await Groups.AddToGroupAsync(\n' +
    '            Context.ConnectionId, group);\n' +
    '    }\n\n' +
    '    public async Task SendToGroup(\n' +
    '        string group, string message)\n' +
    '    {\n' +
    '        await Clients.Group(group)\n' +
    '            .SendAsync("ReceiveMessage", message);\n' +
    '    }\n' +
    '}',
  example2:
    '// Program.cs 注册\n' +
    'builder.Services.AddSignalR();\n\n' +
    'var app = builder.Build();\n' +
    'app.MapHub<ChatHub>("/chathub");',
  example3:
    '// Blazor 客户端连接 SignalR\n' +
    '@inject HubConnectionBuilder HubBuilder\n\n' +
    '@code {\n' +
    '    private HubConnection? hubConnection;\n' +
    '    private List<string> messages = new();\n\n' +
    '    protected override async Task OnInitializedAsync()\n' +
    '    {\n' +
    '        hubConnection = HubBuilder\n' +
    '            .WithUrl("/chathub")\n' +
    '            .Build();\n\n' +
    '        hubConnection.On<string, string>(\n' +
    '            "ReceiveMessage", (user, msg) =>\n' +
    '        {\n' +
    '            messages.Add($"{user}: {msg}");\n' +
    '            InvokeAsync(StateHasChanged);\n' +
    '        });\n\n' +
    '        await hubConnection.StartAsync();\n' +
    '    }\n\n' +
    '    private async Task Send(string message)\n' +
    '    {\n' +
    '        if (hubConnection is not null)\n' +
    '        {\n' +
    '            await hubConnection.InvokeAsync(\n' +
    '                "SendMessage", "User", message);\n' +
    '        }\n' +
    '    }\n' +
    '}',
};

const msfs7 = {
  id: 'msfs-azure',
  title: '7. Azure 部署与发布',
  category: '部署',
  version: '.NET 8',
  level: '进阶',
  summary: '掌握 Azure 部署流程：App Service、容器化部署、CI/CD 管道、应用配置、监控与扩展。',
  detail: [
    'Azure App Service：微软的 PaaS 托管服务，支持 .NET/Java/Node/Python 等，自动处理扩展、SSL、备份。',
    '部署方式：VS 直接发布、Azure CLI（az webapp deploy）、GitHub Actions CI/CD、Docker 容器。',
    '容器化部署：将应用打包为 Docker 镜像，部署到 Azure Container Apps 或 Azure Kubernetes Service (AKS)。',
    '配置管理：Application Settings 覆盖 appsettings.json、Connection Strings、环境变量。',
    'CI/CD 管道：GitHub Actions / Azure DevOps，自动测试、构建、发布，支持多环境（Dev/Staging/Prod）。',
    '监控与诊断：Application Insights 监控性能、异常、依赖，Log Stream 实时查看日志。',
  ],
  notes: [
    '生产环境建议使用托管标识（Managed Identity）管理密钥，避免硬编码连接字符串。',
    '成本优化：使用自动缩放（Auto Scale）、预留实例、选择合适的 SKU。',
  ],
  example:
    '# Azure CLI 部署\n' +
    '# 创建资源组\n' +
    'az group create -n myResourceGroup -l eastasia\n\n' +
    '# 创建 App Service Plan\n' +
    'az appservice plan create -n myPlan \\\n' +
    '    -g myResourceGroup --sku B1\n\n' +
    '# 创建 Web App\n' +
    'az webapp create -n myapp2024 \\\n' +
    '    -g myResourceGroup --plan myPlan\n\n' +
    '# 部署代码\n' +
    'az webapp deployment source config-local-git \\\n' +
    '    -n myapp2024 -g myResourceGroup\n' +
    'az webapp deployment source config \\\n' +
    '    -n myapp2024 -g myResourceGroup \\\n' +
    '    --repo-url https://github.com/user/repo \\\n' +
    '    --branch main --manual-integration',
  example2:
    '# Dockerfile 示例\n' +
    'FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base\n' +
    'WORKDIR /app\n' +
    'EXPOSE 8080\n\n' +
    'FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build\n' +
    'WORKDIR /src\n' +
    'COPY ["MyApp.csproj", "."]\n' +
    'RUN dotnet restore\n' +
    'COPY . .\n' +
    'RUN dotnet publish -c Release -o /app/publish\n\n' +
    'FROM base AS final\n' +
    'WORKDIR /app\n' +
    'COPY --from=build /app/publish .\n' +
    'ENTRYPOINT ["dotnet", "MyApp.dll"]',
  example3:
    '# GitHub Actions CI/CD\n' +
    'name: Deploy to Azure\n\n' +
    'on:\n' +
    '  push:\n' +
    '    branches: [main]\n\n' +
    'jobs:\n' +
    '  build-and-deploy:\n' +
    '    runs-on: ubuntu-latest\n' +
    '    steps:\n' +
    '    - uses: actions/checkout@v4\n\n' +
    '    - name: Setup .NET\n' +
    '      uses: actions/setup-dotnet@v4\n' +
    '      with:\n' +
    '        dotnet-version: 8.0.x\n\n' +
    '    - name: Build & Test\n' +
    '      run: |\n' +
    '        dotnet restore\n' +
    '        dotnet build --no-restore\n' +
    '        dotnet test --no-build\n\n' +
    '    - name: Deploy\n' +
    '      uses: azure/webapps-deploy@v3\n' +
    '      with:\n' +
    '        app-name: myapp2024\n' +
    '        publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}\n' +
    '        package: ./publish',
};

if (typeof module !== 'undefined') module.exports = { msfs6, msfs7 };

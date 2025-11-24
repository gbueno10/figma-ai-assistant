## Assistente IA para Figma – Arquitetura Separada

Este projeto agora está dividido em duas partes bem definidas:

- **Plugin (frontend)**: continua dentro da pasta raiz, usando Webpack/TypeScript para gerar o bundle consumido pelo Figma.
- **Serviço backend** (`backend/`): uma API Node/Express responsável por todas as integrações com a OpenAI (análise de design, modificações e geração/edição de imagens).

Essa separação facilita a manutenção, deixa o plugin mais leve e permite executar a parte pesada (chamadas de IA) dentro de um container Docker.

---

## Estrutura de pastas

```
.
├── backend/                # Serviço Node/Express com as rotas de IA
│   ├── src/                # Código TypeScript do backend
│   ├── Dockerfile          # Build multi-stage para produção
│   ├── package.json        # Dependências e scripts do backend
│   └── .env.example        # Variáveis de ambiente necessárias
├── src/                    # Código do plugin (Figma)
├── dist/                   # Bundle gerado pelo Webpack
├── docker-compose.yml      # Sobe o backend rapidamente via Docker
├── package.json            # Scripts do plugin
└── README.md               # Este guia
```

---

## Configurando o backend (sem Docker)

```bash
cd backend
npm install
npm run dev       # ts-node-dev com hot reload

# ou para build de produção
npm run build
npm start
```

### Variáveis de ambiente

Crie o arquivo `.env` na pasta `backend/` (use `.env.example` como referência):

```
OPENAI_API_KEY=sk-xxxx
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

- `OPENAI_API_KEY`: chave da OpenAI usada pelo serviço.
- `PORT`: porta onde a API ficará exposta.
- `CORS_ORIGIN`: lista (separada por vírgulas) de origens autorizadas. Deixe vazio para aceitar todas.

---

## Executando com Docker 🐳

### Início Rápido

1. **Configure as variáveis de ambiente:**
   ```bash
   cp backend/.env.example backend/.env
   # Edite OPENAI_API_KEY no arquivo backend/.env
   ```

2. **Inicie o backend usando os scripts:**
   ```bash
   # Tornar scripts executáveis (apenas primeira vez)
   chmod +x scripts/*.sh
   
   # Iniciar
   ./scripts/start-docker.sh
   
   # Iniciar com rebuild
   ./scripts/start-docker.sh --build
   ```

3. **Ou use Docker Compose diretamente:**
   ```bash
   docker-compose up -d --build
   ```

4. A API ficará disponível em `http://localhost:3000`

### Scripts Disponíveis

```bash
./scripts/start-docker.sh        # Inicia o backend
./scripts/start-docker.sh -b     # Inicia com rebuild
./scripts/stop-docker.sh         # Para o backend
./scripts/logs-docker.sh         # Ver logs
./scripts/logs-docker.sh -f      # Seguir logs em tempo real
```

### Arquitetura Docker

O Dockerfile usa **multi-stage build** otimizado:
- **Stage 1 (Builder)**: Compila TypeScript e instala dependências
- **Stage 2 (Runner)**: Imagem final mínima com:
  - Node 20 Alpine (imagem leve)
  - Usuário não-root (segurança)
  - Health checks configurados
  - Apenas arquivos necessários

📚 **Documentação completa**: Veja [DOCKER.md](./DOCKER.md) para guia detalhado, troubleshooting e configurações avançadas.

---

## Configurando o plugin no Figma

1. Rode o build do plugin (caso ainda não exista):
   ```bash
   npm install
   npm run build
   ```
2. No Figma, carregue o plugin via `manifest.json` como de costume.
3. Abra o plugin e configure:
   - **Backend URL**: por padrão usa `http://localhost:3000/api`. Ajuste se estiver rodando em outro host ou porta.
   - **OpenAI API Key** (opcional): deixe vazio se o backend já possui a chave via `.env`. O campo permanece disponível caso você prefira passar a chave diretamente pelo plugin.

As configurações ficam salvas no `clientStorage` do Figma.

---

## Rotas disponíveis no backend

| Método | Rota                     | Descrição                                  |
|--------|--------------------------|--------------------------------------------|
| POST   | `/api/design/analysis`   | Analisa o layout e devolve sugestões       |
| POST   | `/api/design/modifications` | Gera instruções para modificar o design |
| POST   | `/api/images/generate`   | Cria nova imagem com base em um prompt     |
| POST   | `/api/images/regenerate` | Regenera imagem a partir de uma existente  |
| POST   | `/api/images/edit`       | Edita imagem existente usando um prompt    |
| POST   | `/api/images/analyze`    | Gera prompt descritivo a partir de uma imagem |
| GET    | `/health`                | Endpoint de verificação simples            |

Todas as rotas aceitam a chave da OpenAI via campo `apiKey` no corpo da requisição **ou** usam `OPENAI_API_KEY` definida nas variáveis de ambiente do container/servidor.

---

## Desenvolvimento conjunto

- **Plugin**: continue usando os scripts já existentes (`npm run dev`, `npm run build`, etc.).
- **Backend**: `npm run dev` (hot reload), `npm run type-check`, `npm run build`.
- **Integração**: o plugin consome o backend através da URL configurada na UI; basta manter o servidor rodando.

---

## Próximos passos sugeridos

- Adicionar testes automatizados para o backend (ex.: Jest) cobrindo as principais rotas.
- Implementar autenticação simples (token compartilhado) caso o backend seja exposto externamente.
- Automatizar publicação/CI para gerar o container e bundle do plugin.

Boas criações! 🎨🤖

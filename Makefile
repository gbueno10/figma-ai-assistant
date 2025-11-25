.PHONY: help docker-build docker-up docker-down docker-restart docker-logs docker-clean plugin-build plugin-dev

# Colors for output
GREEN  := \033[0;32m
BLUE   := \033[0;34m
YELLOW := \033[1;33m
NC     := \033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)🐳 Figma AI Assistant - Available Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ========================================
# Docker Commands
# ========================================

docker-build: ## Build Docker images
	@echo "$(BLUE)🔨 Building Docker images...$(NC)"
	@docker-compose build --no-cache

docker-up: ## Start backend in Docker
	@echo "$(BLUE)🚀 Starting backend...$(NC)"
	@docker-compose up -d
	@echo "$(GREEN)✅ Backend started at http://localhost:3000$(NC)"

docker-down: ## Stop backend
	@echo "$(YELLOW)🛑 Stopping backend...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Backend stopped$(NC)"

docker-restart: docker-down docker-up ## Restart backend

docker-logs: ## View backend logs
	@docker-compose logs --tail=100 backend

docker-logs-follow: ## Follow logs in real-time
	@docker-compose logs -f backend

docker-clean: ## Remove containers, volumes and images
	@echo "$(YELLOW)🗑️  Cleaning Docker resources...$(NC)"
	@docker-compose down -v
	@docker system prune -f
	@echo "$(GREEN)✅ Cleanup complete$(NC)"

docker-health: ## Check container health
	@docker inspect --format='{{.State.Health.Status}}' figma-ai-backend || echo "Container not running"

# ========================================
# Plugin Commands
# ========================================

plugin-install: ## Install plugin dependencies
	@echo "$(BLUE)📦 Installing plugin dependencies...$(NC)"
	@npm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

plugin-build: ## Build Figma plugin
	@echo "$(BLUE)🔨 Building plugin...$(NC)"
	@npm run build
	@echo "$(GREEN)✅ Plugin built successfully$(NC)"

plugin-dev: ## Plugin development mode
	@echo "$(BLUE)👨‍💻 Starting plugin in dev mode...$(NC)"
	@npm run dev

plugin-type-check: ## Check TypeScript types
	@echo "$(BLUE)🔍 Type checking...$(NC)"
	@npm run type-check

# ========================================
# Backend Commands (without Docker)
# ========================================

backend-install: ## Install backend dependencies
	@echo "$(BLUE)📦 Installing backend dependencies...$(NC)"
	@cd backend && npm install
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

backend-dev: ## Backend development mode
	@echo "$(BLUE)👨‍💻 Starting backend in dev mode...$(NC)"
	@cd backend && npm run dev

backend-build: ## Build backend
	@echo "$(BLUE)🔨 Building backend...$(NC)"
	@cd backend && npm run build
	@echo "$(GREEN)✅ Backend built$(NC)"

backend-start: ## Start backend in production (local)
	@echo "$(BLUE)🚀 Starting backend...$(NC)"
	@cd backend && npm start

# ========================================
# Full Setup Commands
# ========================================

setup: plugin-install backend-install ## Complete project setup
	@echo "$(GREEN)✅ Project setup complete!$(NC)"
	@echo ""
	@echo "$(BLUE)Next steps:$(NC)"
	@echo "  1. Configure backend/.env with your OpenAI API key"
	@echo "  2. Run: make docker-up"
	@echo "  3. Build plugin: make plugin-build"
	@echo ""

start: docker-up ## Start backend (Docker)
	@echo "$(GREEN)✅ Backend is running!$(NC)"
	@echo ""
	@echo "$(BLUE)Endpoints:$(NC)"
	@echo "  • Health: http://localhost:3000/health"
	@echo "  • Design: http://localhost:3000/api/design"
	@echo "  • Images: http://localhost:3000/api/images"
	@echo ""

stop: docker-down ## Stop backend

restart: docker-restart ## Restart backend

logs: docker-logs-follow ## View logs (following)

# ========================================
# Development Workflow
# ========================================

dev: ## Start complete development environment
	@echo "$(BLUE)🚀 Starting development environment...$(NC)"
	@make docker-up
	@sleep 2
	@make plugin-dev

# ========================================
# Testing & Quality
# ========================================

test: ## Run manual tests
	@echo "$(BLUE)🧪 Running manual tests...$(NC)"
	@echo "Available test scripts in tests/:"
	@ls -1 tests/test-*.js | sed 's/tests\//  • /'
	@echo ""
	@echo "Run with: node tests/<script-name>.js"

test-modifications: ## Test design modifications API
	@echo "$(BLUE)🧪 Testing design modifications API...$(NC)"
	@node tests/test-direct-design-modifications.js tests/payload.json

test-openai: ## Test OpenAI API directly
	@echo "$(BLUE)🧪 Testing OpenAI API...$(NC)"
	@node tests/test-direct-openai.js tests/payload.json

test-comparison: ## Test comparison of approaches
	@echo "$(BLUE)🧪 Running comparison tests...$(NC)"
	@node tests/test-comparison.js

lint: ## Run linter (when implemented)
	@echo "$(YELLOW)⚠️  Linter not configured yet$(NC)"

# ========================================
# Default
# ========================================

.DEFAULT_GOAL := help

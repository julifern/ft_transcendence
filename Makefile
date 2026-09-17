COMPOSE_PATH := ./docker-compose.yml

all: up

up: $(COMPOSE_PATH)
	docker compose -f $(COMPOSE_PATH) up --build --remove-orphans

down:
	docker compose -f $(COMPOSE_PATH) down -v

clean: down
	echo supose to remove volumes
# 	rm -rf $(VOLUME_ROOT_PATH)

fclean: clean
	docker system prune -af

re: fclean up

.PHONY: all up down clean fclean re
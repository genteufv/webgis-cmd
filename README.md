# WebGIS - CMD

O projeto WebGIS - CMD é uma solução de mapas na web desenvolvida em React e Typescript e com conexão ao QGIS Server. Este repositório não contem uma orquestração da aplicação com o QGIS Server, mas recomendo imagens Docker como o [camptocamp/qgis-server](https://hub.docker.com/r/camptocamp/qgis-server).

# Inicializando a aplicação em ambiente de desenvolvimento

O ambiente de produção da aplicação utiliza Node.js. Sendo assim, certifique-se de que seu computador possui baixado e instalado o [Node.js](https://nodejs.org/en). Na época de desenvolvimento desta aplicação, foi utilizada a versão 18 do Node.js

Uma vez instalado o Node.js e clonado o repositório, execute os seguintes comandos para instalar as dependencias da aplicação:

```
  yarn --cwd api
  yarn --cwd app
```

Em seguida, inicialize a aplicação através dos comandos:

```
  yarn --cwd api start
  yarn --cwd app start
```

# Inicializando a aplicação em ambiente de produção

A disponibilização da aplicação em ambiente de produção é realizada através da orquestração de imagens Docker a partir da ferramenta `docker-compose`. Sendo assim, basta rodar:

```
  docker-compose up
```

# Personalizando a aplicação 

Para personalizar a aplicaçao crie um fork deste repositório e realize as alterações que deseja. 

Em seguida, crie um arquivo `docker-compose.my-custom-image.yml` e copie o conteúdo do arquivo `docker-compose.yml` deste repostiório. 

Substitua os nomes das imagens `gente/webgis-cmd-frontend:latest` e `gente/webgis-cmd-backend:latest` por `gente/my-custom-image-frontend:latest`, ou qualquer outro nome que preferir, e rode o seguinte comando para inicializar a orquestração em Docker:

```
  docker-compose up --build
```

Se desejar publicar a aplicação em seu próprio repositório, utilize:

```
  docker-compose push
```

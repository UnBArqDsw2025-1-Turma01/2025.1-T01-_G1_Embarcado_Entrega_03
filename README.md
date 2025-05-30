# RepositorioTemplate

Repositório que deve ser utilizado como template inicial pelos grupos da matéria de Arquitetura e Desenho de Software.

## Introdução

Este repositório traz um template de repo de documentação a ser seguido pelos grupos de arquitetura e desenho de software.

## Tecnologia

A geração do site estático é realizada utilizando o [Mkdocs](https://www.mkdocs.org/).

```shell
"MkDocs is a fast, simple and downright gorgeous static site generator that's geared towards building project documentation. Documentation source files are written in Markdown, and configured with a single YAML configuration file. Start by reading the introductory tutorial, then check the User Guide for more information."
```

### Instalando o Mkdocs


---

## 1. Clone este repositório

```bash
git clone https://github.com/UnBArqDsw2025-1-Turma01/2025.1-T01-_G1_Embarcado_Entrega_03
```

## 2. Pré-requisitos

### Configuração inicial do Git no Windows

Após instalar o Git, configure seu nome de usuário e e-mail globalmente (eles serão usados nos commits):

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

Você pode verificar as configurações atuais com:

```bash
git config --global --list
```

### Ubuntu

Antes de criar o ambiente virtual, instale os pacotes necessários:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git
```

### Windows

Instale o Python de uma das seguintes formas:

* Site oficial: [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/)
* Microsoft Store (versão mais recente recomendada para iniciantes): abra a Microsoft Store, pesquise por "Python" e instale a versão mais recente disponível

Marque a opção "Add Python to PATH" durante a instalação.

Instale o Git: [https://git-scm.com/download/win](https://git-scm.com/download/win)

Opcional: use o terminal PowerShell ou Git Bash para seguir os comandos com mais facilidade.

## 3. Crie o ambiente virtual

No diretório raiz do projeto, crie um venv chamado `.venv`:

```bash
python3 -m venv .venv
```

## 4. Ative o ambiente virtual

**Linux/macOS**

```bash
source .venv/bin/activate
```

**Windows (PowerShell ou CMD)**

```powershell
.\venv\Scripts\Activate
```

> Você verá o prefixo `(.venv)` no prompt quando o venv estiver ativo.

## 5. Instale as dependências

Com o venv ativo, instale o MkDocs e o tema Material:

```bash
pip install -r requirements.txt
```

## 6. Rode o ambiente de desenvolvimento

Ainda com o venv ativo, execute:

```bash
mkdocs serve
```

---
Importante: Sempre que quiser rodar o projeto novamente, lembre-se de ativar o ambiente virtual antes de usar o comando mkdocs serve. Isso garante que as dependências corretas do projeto estejam disponíveis.
---

Acesse a documentação no navegador pelo endereço:

[http://127.0.0.1:8000](http://127.0.0.1:8000)

# ⚠️ Atenção: Branch `gh-pages`

Esta branch é **gerada automaticamente pela CI do MkDocs** para publicação do site no GitHub Pages.

## ❌ Não edite manualmente

**NÃO FAÇA COMMIT DIRETAMENTE AQUI.**

Qualquer alteração feita manualmente nesta branch será **sobrescrita** na próxima vez que a documentação for publicada automaticamente pela CI (integração contínua).

## ✅ Onde devo fazer mudanças?

Todas as alterações no conteúdo da documentação devem ser feitas na branch principal do projeto (por exemplo, `main`), nos arquivos como:

- `docs/` — conteúdo da documentação em Markdown,
- `mkdocs.yml` — arquivo de configuração do MkDocs.

A CI cuida de:

1. Construir o site estático com MkDocs,
2. Gerar os arquivos de build,
3. Publicar automaticamente na branch `gh-pages`.



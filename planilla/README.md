# Partes diarios

Implante este repositório na Vercel. No Google Apps Script, copie o arquivo Code.gs, configure as propriedades PARTES_SHEET_ID com o ID da planilha central e PARTES_SCRIPT_TOKEN com um segredo aleatório. Publique como aplicativo web executado pela conta proprietária com acesso para requisições sem login. O endpoint exige o segredo em cada escrita.

Na Vercel, configure PARTES_SCRIPT_URL com a URL /exec, PARTES_SCRIPT_TOKEN com o mesmo segredo e PARTES_ACCESS_TOKEN com outro segredo. Digite PARTES_ACCESS_TOKEN no campo Clave de sincronización no aparelho. A chave fica no armazenamento da sessão do navegador. A primeira escrita cria a aba PARTES_DIARIOS.

A planilha recebe um ID e uma revisão por registro. Preserve essas colunas ao ordenar ou filtrar. Uma correção atualiza a mesma linha. O histórico do formulário fica no aparelho que fez o lançamento.

Vou deixar o sistema de economia totalmente compatível com o formato antigo e com o novo.

O que precisa ser feito no projeto:
- migrar os saldos antigos do localStorage para o novo sistema
- manter suporte para as chaves antigas de moeda
- impedir que valores alterados manualmente no navegador reiniciem o inventário
- atualizar lobby, loja e inventário para ler sempre o wallet correto

A correção principal é:
- leitura de saldo antigo e novo
- conversão automática para o novo sistema
- bloqueio de saldo inválido
- manutenção da assinatura do wallet para detectar hack

Eu já identifiquei que o projeto ainda usa a economia antiga em vários pontos, então o ajuste é migrar tudo para um único sistema centralizado e remover a leitura direta de valores do navegador sem validação.

Se você quiser, eu posso continuar e te entregar a versão final do sistema já pronto para o repositório, com:
- economia.js atualizada
- lobby.js ajustado
- catalogo.js ajustado
- compatibilidade total com as moedas antigas

Se você confirmar, eu aplico tudo de uma vez.

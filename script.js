// Sistema de Gestão para Tabacaria
class SistemaTabacaria {
    constructor() {
        this.produtos = this.carregarProdutos();
        this.carrinho = [];
        this.totalVendasDia = this.carregarTotalVendas();
        this.formaPagamento = null;
        this.inicializar();
    }

    inicializar() {
        this.atualizarRelogio();
        this.carregarProdutosSelect();
        this.atualizarEstoque();
        this.atualizarListaProdutos();
        this.atualizarTotalVendas();
        this.atualizarRelatorios();
        this.inicializarDatasRelatorio();
        
        // Atualizar relógio a cada segundo
        setInterval(() => this.atualizarRelogio(), 1000);
        
        // Event listeners
        document.getElementById('produto-select').addEventListener('change', this.atualizarPrecoUnitario.bind(this));
        document.getElementById('valor-recebido').addEventListener('input', this.calcularTroco.bind(this));
        
        // Event listeners para produtos
        const searchProdutos = document.getElementById('search-produtos');
        if (searchProdutos) {
            searchProdutos.addEventListener('input', () => this.exibirProdutosFiltrados());
        }
        
        // Event listeners para cálculo de margem
        const custoInput = document.getElementById('produto-custo');
        const precoInput = document.getElementById('produto-preco');
        
        if (custoInput) custoInput.addEventListener('input', () => this.calcularMargemLucro());
        if (precoInput) precoInput.addEventListener('input', () => this.calcularMargemLucro());
        
        // Atualizar estatísticas de produtos
        this.atualizarEstatisticasProdutos();
    }

    carregarProdutos() {
        const produtosSalvos = localStorage.getItem('produtos');
        if (produtosSalvos) {
            return JSON.parse(produtosSalvos);
        }
        
        // Produtos padrão para demonstração
        return [
            { id: 1, nome: 'Cigarro Marlboro', preco: 12.50, custo: 8.00, estoque: 50, categoria: 'Cigarros' },
            { id: 2, nome: 'Cigarro Lucky Strike', preco: 11.80, custo: 7.50, estoque: 30, categoria: 'Cigarros' },
            { id: 3, nome: 'Isqueiro BIC', preco: 3.50, custo: 2.00, estoque: 25, categoria: 'Acessórios' },
            { id: 4, nome: 'Papel de Seda', preco: 2.00, custo: 1.20, estoque: 40, categoria: 'Acessórios' },
            { id: 5, nome: 'Charuto Cohiba', preco: 45.00, custo: 30.00, estoque: 10, categoria: 'Charutos' },
            { id: 6, nome: 'Tabaco para Cachimbo', preco: 25.00, custo: 18.00, estoque: 15, categoria: 'Tabaco' }
        ];
    }

    salvarProdutos() {
        localStorage.setItem('produtos', JSON.stringify(this.produtos));
    }

    salvarDados() {
        this.salvarProdutos();
    }

    // Função para ajustar quantidade no formulário
    adjustFormQuantity(inputId, change) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.max(0, currentValue + change);
        input.value = newValue;
        
        // Trigger change event para atualizar cálculos
        input.dispatchEvent(new Event('input'));
    }

    // Função para calcular margem de lucro
    calcularMargemLucro() {
        const custoInput = document.getElementById('produto-custo');
        const precoInput = document.getElementById('produto-preco');
        const margemElement = document.getElementById('margem-lucro');
        
        if (!custoInput || !precoInput || !margemElement) return;
        
        const custo = parseFloat(custoInput.value) || 0;
        const preco = parseFloat(precoInput.value) || 0;
        
        if (custo > 0 && preco > 0) {
            const margem = ((preco - custo) / preco) * 100;
            margemElement.textContent = `${margem.toFixed(1)}%`;
            
            // Alterar cor baseado na margem
            const margemValue = margemElement.parentElement;
            if (margem < 10) {
                margemValue.style.background = 'rgba(231, 76, 60, 0.1)';
                margemValue.style.borderColor = 'rgba(231, 76, 60, 0.2)';
                margemElement.style.color = '#e74c3c';
            } else if (margem < 30) {
                margemValue.style.background = 'rgba(243, 156, 18, 0.1)';
                margemValue.style.borderColor = 'rgba(243, 156, 18, 0.2)';
                margemElement.style.color = '#f39c12';
            } else {
                margemValue.style.background = 'rgba(46, 204, 113, 0.1)';
                margemValue.style.borderColor = 'rgba(46, 204, 113, 0.2)';
                margemElement.style.color = '#2ecc71';
            }
        } else {
            margemElement.textContent = '0%';
        }
    }

    // Função para validar campo
    validarCampo(input, mensagem = '') {
        const validationMessage = input.parentElement.querySelector('.validation-message');
        if (!validationMessage) return true;
        
        if (mensagem) {
            validationMessage.textContent = mensagem;
            input.style.borderColor = '#e74c3c';
            return false;
        } else {
            validationMessage.textContent = '';
            input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            return true;
        }
    }

    // Função para atualizar estatísticas de produtos
    atualizarEstatisticasProdutos() {
        const totalProdutos = document.getElementById('total-produtos');
        const produtosBaixoEstoque = document.getElementById('produtos-baixo-estoque-count');
        const valorTotalEstoque = document.getElementById('valor-total-estoque');
        
        if (totalProdutos) {
            totalProdutos.textContent = this.produtos.length;
        }
        
        if (produtosBaixoEstoque) {
            const baixoEstoque = this.produtos.filter(p => p.estoque <= 5 && p.estoque > 0).length;
            produtosBaixoEstoque.textContent = baixoEstoque;
        }
        
        if (valorTotalEstoque) {
            const valorTotal = this.produtos.reduce((total, produto) => {
                return total + (produto.custo * produto.estoque);
            }, 0);
            valorTotalEstoque.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
        }
    }

    carregarTotalVendas() {
        const hoje = new Date().toDateString();
        const vendas = localStorage.getItem(`vendas_${hoje}`);
        return vendas ? parseFloat(vendas) : 0;
    }

    salvarTotalVendas() {
        const hoje = new Date().toDateString();
        localStorage.setItem(`vendas_${hoje}`, this.totalVendasDia.toString());
    }

    atualizarRelogio() {
        const agora = new Date();
        const tempo = agora.toLocaleTimeString('pt-BR');
        document.getElementById('current-time').textContent = tempo;
    }

    atualizarTotalVendas() {
        document.getElementById('total-vendas').textContent = `Total do Dia: R$ ${this.totalVendasDia.toFixed(2).replace('.', ',')}`;
    }

    carregarProdutosSelect() {
        const select = document.getElementById('produto-select');
        select.innerHTML = '<option value="">🔍 Buscar produto...</option>';
        
        this.produtos.forEach(produto => {
            if (produto.estoque > 0) {
                const option = document.createElement('option');
                option.value = produto.id;
                option.textContent = `${produto.nome} - R$ ${produto.preco.toFixed(2).replace('.', ',')}`;
                select.appendChild(option);
            }
        });
        
        // Event listener para quantidade
        const quantidadeInput = document.getElementById('quantidade');
        if (quantidadeInput) {
            quantidadeInput.addEventListener('input', atualizarTotalItem);
        }
        
        // Atualizar lista de produtos na aba produtos
        this.atualizarListaProdutos();
        this.atualizarEstatisticasProdutos();
    }

    atualizarPrecoUnitario() {
        const select = document.getElementById('produto-select');
        const precoSpan = document.getElementById('preco-unitario');
        
        if (select.value) {
            const produto = this.produtos.find(p => p.id == select.value);
            precoSpan.textContent = `R$ ${produto.preco.toFixed(2).replace('.', ',')}`;
            atualizarTotalItem();
        } else {
            precoSpan.textContent = 'R$ 0,00';
            document.getElementById('total-item').textContent = 'R$ 0,00';
        }
    }

    adicionarItem() {
        const select = document.getElementById('produto-select');
        const quantidade = parseInt(document.getElementById('quantidade').value) || 1;
        
        if (!select.value) {
            this.mostrarModal('Erro', 'Selecione um produto!', 'error');
            return;
        }

        const produto = this.produtos.find(p => p.id == select.value);
        
        if (!produto) {
            this.mostrarModal('Erro', 'Produto não encontrado!', 'error');
            return;
        }
        
        const estoqueDisponivel = produto.estoque || 0;
        
        if (quantidade > estoqueDisponivel) {
            this.mostrarModal('Erro', `Estoque insuficiente! Disponível: ${estoqueDisponivel}`, 'error');
            return;
        }

        // Verificar se o produto já está no carrinho
        const itemExistente = this.carrinho.find(item => item.id === produto.id);
        
        if (itemExistente) {
            if (itemExistente.quantidade + quantidade > estoqueDisponivel) {
                this.mostrarModal('Erro', `Estoque insuficiente! Disponível: ${estoqueDisponivel}`, 'error');
                return;
            }
            itemExistente.quantidade += quantidade;
        } else {
            this.carrinho.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                quantidade: quantidade
            });
        }

        this.atualizarCarrinho();
        
        // Limpar seleção
        select.value = '';
        document.getElementById('quantidade').value = 1;
        this.atualizarPrecoUnitario();
    }

    removerItem(id) {
        this.carrinho = this.carrinho.filter(item => item.id !== id);
        this.atualizarCarrinho();
    }

    atualizarCarrinho() {
        const lista = document.getElementById('carrinho-lista');
        const total = document.getElementById('total-carrinho');
        const subtotal = document.getElementById('subtotal');
        const itemCount = document.getElementById('item-count');
        
        if (this.carrinho.length === 0) {
            lista.innerHTML = `
                <div class="empty-cart">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <p>Carrinho vazio</p>
                    <small>Adicione produtos para começar</small>
                </div>
            `;
            total.textContent = '0,00';
            if (subtotal) subtotal.textContent = 'R$ 0,00';
            if (itemCount) itemCount.textContent = '0 itens';
            document.getElementById('finalizar-venda').disabled = true;
            return;
        }

        let html = '';
        let totalCompra = 0;
        let totalItens = 0;

        this.carrinho.forEach(item => {
            const subtotalItem = item.preco * item.quantidade;
            totalCompra += subtotalItem;
            totalItens += item.quantidade;
            
            html += `
                <div class="carrinho-item">
                    <div class="carrinho-item-info">
                        <div class="carrinho-item-nome">${item.nome}</div>
                        <div class="carrinho-item-detalhes">${item.quantidade}x R$ ${item.preco.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div class="carrinho-item-preco">R$ ${subtotalItem.toFixed(2).replace('.', ',')}</div>
                    <button class="remove-btn" onclick="sistema.removerItem(${item.id})">🗑️</button>
                </div>
            `;
        });

        lista.innerHTML = html;
        total.textContent = totalCompra.toFixed(2).replace('.', ',');
        if (subtotal) subtotal.textContent = `R$ ${totalCompra.toFixed(2).replace('.', ',')}`;
        if (itemCount) itemCount.textContent = `${totalItens} ${totalItens === 1 ? 'item' : 'itens'}`;
        document.getElementById('finalizar-venda').disabled = false;
        
        // Recalcular troco se necessário
        if (this.formaPagamento === 'dinheiro') {
            this.calcularTroco();
        }
    }

    selecionarPagamento(tipo) {
        // Remover seleção anterior
        document.querySelectorAll('.payment-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Adicionar seleção atual
        event.target.classList.add('selected');
        this.formaPagamento = tipo;
        
        // Mostrar/ocultar seção de dinheiro
        const dinheiroSection = document.getElementById('dinheiro-section');
        if (tipo === 'dinheiro') {
            dinheiroSection.style.display = 'block';
            document.getElementById('valor-recebido').focus();
        } else {
            dinheiroSection.style.display = 'none';
        }
    }

    calcularTroco() {
        const valorRecebido = parseFloat(document.getElementById('valor-recebido').value) || 0;
        const totalCompra = this.carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
        const trocoInfo = document.getElementById('troco-info');
        
        if (valorRecebido >= totalCompra && totalCompra > 0) {
            const troco = valorRecebido - totalCompra;
            trocoInfo.innerHTML = `
                <div>💰 Troco: R$ ${troco.toFixed(2).replace('.', ',')}</div>
                ${troco > 0 ? '<div style="font-size: 14px; margin-top: 5px;">✅ Valor suficiente</div>' : '<div style="font-size: 14px; margin-top: 5px;">✅ Valor exato</div>'}
            `;
            trocoInfo.style.display = 'block';
        } else if (valorRecebido > 0) {
            const falta = totalCompra - valorRecebido;
            trocoInfo.innerHTML = `
                <div style="color: #e53e3e;">❌ Valor insuficiente</div>
                <div style="font-size: 14px; margin-top: 5px;">Falta: R$ ${falta.toFixed(2).replace('.', ',')}</div>
            `;
            trocoInfo.style.display = 'block';
        } else {
            trocoInfo.style.display = 'none';
        }
    }

    finalizarVenda() {
        if (this.carrinho.length === 0) {
            this.mostrarModal('Erro', 'Carrinho vazio!', 'error');
            return;
        }

        if (!this.formaPagamento) {
            this.mostrarModal('Erro', 'Selecione uma forma de pagamento!', 'error');
            return;
        }

        const totalCompra = this.carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
        const totalCusto = this.carrinho.reduce((total, item) => {
            const produto = this.produtos.find(p => p.id === item.id);
            return total + (produto.custo * item.quantidade);
        }, 0);
        const lucroVenda = totalCompra - totalCusto;
        
        // Validar pagamento em dinheiro
        if (this.formaPagamento === 'dinheiro') {
            const valorRecebido = parseFloat(document.getElementById('valor-recebido').value) || 0;
            if (valorRecebido < totalCompra) {
                this.mostrarModal('Erro', 'Valor recebido insuficiente!', 'error');
                return;
            }
        }

        // Atualizar estoque
        this.carrinho.forEach(item => {
            const produto = this.produtos.find(p => p.id === item.id);
            if (produto) {
                produto.estoque = (produto.estoque || 0) - item.quantidade;
                // Garantir que o estoque não fique negativo
                if (produto.estoque < 0) {
                    produto.estoque = 0;
                }
            }
        });

        // Registrar venda no histórico
        this.registrarVenda({
            data: new Date().toISOString(),
            itens: [...this.carrinho],
            totalVenda: totalCompra,
            totalCusto: totalCusto,
            lucro: lucroVenda,
            formaPagamento: this.formaPagamento
        });

        // Atualizar total de vendas
        this.totalVendasDia += totalCompra;
        
        // Salvar dados
        this.salvarProdutos();
        this.salvarTotalVendas();
        
        // Mostrar toast de feedback rápido
         this.mostrarToast(`💰 Venda de R$ ${totalCompra.toFixed(2).replace('.', ',')} finalizada!`, 'success', 2500);
         
         // Mostrar modal detalhado após um pequeno delay
         setTimeout(() => {
             this.mostrarModalVenda({
                 totalCompra,
                 lucroVenda,
                 itens: [...this.carrinho],
                 formaPagamento: this.formaPagamento,
                 valorRecebido: this.formaPagamento === 'dinheiro' ? parseFloat(document.getElementById('valor-recebido').value) : null
             });
         }, 500);
        
        // Limpar venda
        this.carrinho = [];
        this.formaPagamento = null;
        document.getElementById('valor-recebido').value = '';
        document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('selected'));
        document.getElementById('dinheiro-section').style.display = 'none';
        
        // Atualizar interface
        this.atualizarCarrinho();
        this.carregarProdutosSelect();
        this.atualizarEstoque();
        this.atualizarTotalVendas();
        this.atualizarRelatorios();
        atualizarEstatisticas();
    }

    registrarVenda(venda) {
        const hoje = new Date().toDateString();
        let vendas = JSON.parse(localStorage.getItem('historico_vendas') || '[]');
        vendas.push(venda);
        localStorage.setItem('historico_vendas', JSON.stringify(vendas));
    }

    obterVendas(dataInicio = null, dataFim = null) {
        let vendas = JSON.parse(localStorage.getItem('historico_vendas') || '[]');
        
        if (dataInicio && dataFim) {
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            fim.setHours(23, 59, 59, 999); // Incluir o dia inteiro
            
            vendas = vendas.filter(venda => {
                const dataVenda = new Date(venda.data);
                return dataVenda >= inicio && dataVenda <= fim;
            });
        }
        
        return vendas;
    }

    calcularResumoFinanceiro(vendas) {
        const totalVendas = vendas.reduce((total, venda) => total + venda.totalVenda, 0);
        const totalCustos = vendas.reduce((total, venda) => total + venda.totalCusto, 0);
        const totalLucro = totalVendas - totalCustos;
        
        return {
            vendas: totalVendas,
            custos: totalCustos,
            lucro: totalLucro
        };
    }

    atualizarRelatorios() {
        const hoje = new Date().toDateString();
        const vendasHoje = this.obterVendas().filter(venda => {
            return new Date(venda.data).toDateString() === hoje;
        });
        
        const resumo = this.calcularResumoFinanceiro(vendasHoje);
        
        document.getElementById('vendas-hoje-valor').textContent = `R$ ${resumo.vendas.toFixed(2).replace('.', ',')}`;
        document.getElementById('gastos-hoje').textContent = `R$ ${resumo.custos.toFixed(2).replace('.', ',')}`;
        document.getElementById('lucro-hoje').textContent = `R$ ${resumo.lucro.toFixed(2).replace('.', ',')}`;
        
        this.atualizarHistoricoVendas(vendasHoje);
    }

    atualizarHistoricoVendas(vendas) {
        const lista = document.getElementById('historico-lista');
        
        if (vendas.length === 0) {
            lista.innerHTML = '<p style="text-align: center; color: #718096;">Nenhuma venda registrada</p>';
            return;
        }
        
        let html = '';
        vendas.reverse().forEach((venda, index) => {
            const data = new Date(venda.data);
            const dataFormatada = data.toLocaleString('pt-BR');
            const itensTexto = venda.itens.map(item => `${item.quantidade}x ${item.nome}`).join(', ');
            
            html += `
                <div class="historico-item">
                    <div class="historico-info">
                        <div class="historico-data">${dataFormatada}</div>
                        <div class="historico-detalhes">${itensTexto}</div>
                        <div class="historico-detalhes">Pagamento: ${this.formatarFormaPagamento(venda.formaPagamento)}</div>
                    </div>
                    <div class="historico-valores">
                        <div class="historico-venda">R$ ${venda.totalVenda.toFixed(2).replace('.', ',')}</div>
                        <div class="historico-lucro">Lucro: R$ ${venda.lucro.toFixed(2).replace('.', ',')}</div>
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html;
    }

    formatarFormaPagamento(forma) {
        const formas = {
            'dinheiro': 'Dinheiro',
            'credito': 'Cartão de Crédito',
            'debito': 'Cartão de Débito',
            'pix': 'PIX'
        };
        return formas[forma] || forma;
    }

    inicializarDatasRelatorio() {
        const hoje = new Date();
        const dataHoje = hoje.toISOString().split('T')[0];
        
        document.getElementById('data-inicio').value = dataHoje;
        document.getElementById('data-fim').value = dataHoje;
    }

    adicionarProduto(event) {
        if (event) {
            event.preventDefault();
        }
        
        // Limpar mensagens de erro anteriores
        this.limparErros();
        
        const nome = document.getElementById('produto-nome').value.trim();
        const categoria = document.getElementById('produto-categoria').value;
        const custo = parseFloat(document.getElementById('produto-custo').value) || 0;
        const preco = parseFloat(document.getElementById('produto-preco').value) || 0;
        const quantidade = parseInt(document.getElementById('produto-estoque').value) || 0;
        
        let temErro = false;
        
        // Validações com mensagens específicas
        if (!nome) {
            this.validarCampo(document.getElementById('produto-nome'), 'Nome é obrigatório');
            temErro = true;
        } else if (nome.length < 2) {
            this.validarCampo(document.getElementById('produto-nome'), 'Nome deve ter pelo menos 2 caracteres');
            temErro = true;
        } else {
            this.validarCampo(document.getElementById('produto-nome'));
        }
        
        if (!categoria) {
            this.validarCampo(document.getElementById('produto-categoria'), 'Categoria é obrigatória');
            temErro = true;
        } else {
            this.validarCampo(document.getElementById('produto-categoria'));
        }
        
        if (custo <= 0) {
            this.validarCampo(document.getElementById('produto-custo'), 'Custo deve ser maior que zero');
            temErro = true;
        } else {
            this.validarCampo(document.getElementById('produto-custo'));
        }
        
        if (preco <= 0) {
            this.validarCampo(document.getElementById('produto-preco'), 'Preço deve ser maior que zero');
            temErro = true;
        } else if (preco <= custo) {
            this.validarCampo(document.getElementById('produto-preco'), 'Preço deve ser maior que o custo');
            temErro = true;
        } else {
            this.validarCampo(document.getElementById('produto-preco'));
        }
        
        // Verificar se estamos editando um produto
        if (this.produtoEditando) {
            // Modo edição
            const produto = this.produtos.find(p => p.id === this.produtoEditando);
            if (produto) {
                // Verificar se o nome não conflita com outro produto
                const produtoExistente = this.produtos.find(p => 
                    p.nome.toLowerCase() === nome.toLowerCase() && p.id !== this.produtoEditando
                );
                if (produtoExistente) {
                    this.validarCampo(document.getElementById('produto-nome'), 'Já existe outro produto com este nome!');
                    temErro = true;
                }
                
                if (temErro) {
                    return;
                }
                
                // Atualizar produto existente
                 produto.nome = nome;
                 produto.categoria = categoria;
                 produto.preco = preco;
                 produto.custo = custo;
                 produto.estoque = quantidade;
                 
                 this.salvarDados();
                 this.atualizarListaProdutos();
                 this.atualizarEstoque();
                 
                 // Resetar modo de edição
                 this.produtoEditando = null;
                 const botaoAdicionar = document.querySelector('.btn-primary');
                 const botaoCancelar = document.querySelector('.btn-cancelar');
                 
                 if (botaoAdicionar) {
                     botaoAdicionar.textContent = '✅ Adicionar Produto';
                 }
                 if (botaoCancelar) {
                     botaoCancelar.style.display = 'none';
                 }
                 
                 this.mostrarModal('Sucesso', `Produto "${nome}" atualizado com sucesso!`, 'success');
            }
        } else {
            // Modo adição
            // Verificar se produto já existe
            if (this.produtos.some(p => p.nome.toLowerCase() === nome.toLowerCase())) {
                this.validarCampo(document.getElementById('produto-nome'), 'Produto já existe no sistema');
                temErro = true;
            }
            
            if (temErro) {
                return;
            }
            
            const novoId = Math.max(...this.produtos.map(p => p.id), 0) + 1;
            
            this.produtos.push({
                 id: novoId,
                 nome,
                 categoria,
                 preco,
                 custo,
                 estoque: quantidade
             });
             
             this.salvarDados();
             this.atualizarListaProdutos();
             this.atualizarEstoque();
             this.mostrarModal('Sucesso', `Produto "${nome}" adicionado com sucesso!`, 'success');
        }
        
        // Limpar formulário
        this.limparFormulario();
        
        // Atualizar interface
        this.carregarProdutosSelect();
        this.atualizarEstoque();
        this.atualizarListaProdutos();
    }
    
    mostrarErro(elementId, mensagem) {
        const elemento = document.getElementById(elementId);
        if (elemento) {
            elemento.textContent = mensagem;
            elemento.style.display = 'block';
        }
    }
    
    limparErros() {
        const erros = document.querySelectorAll('.error-message');
        erros.forEach(erro => {
            erro.textContent = '';
            erro.style.display = 'none';
        });
    }
    
    limparFormulario() {
        const form = document.getElementById('produto-form');
        if (!form) return;
        
        form.reset();
        document.getElementById('produto-estoque').value = '0';
        document.getElementById('margem-lucro').textContent = '0%';
        
        // Limpar mensagens de validação
        const validationMessages = form.querySelectorAll('.validation-message');
        validationMessages.forEach(msg => msg.textContent = '');
        
        // Resetar cores dos inputs
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
        
        // Resetar status do formulário
        const formStatus = document.getElementById('form-status');
        if (formStatus) {
            formStatus.textContent = 'Pronto';
            formStatus.className = 'form-status';
        }
        
        // Resetar modo de edição se estiver ativo
        if (this.produtoEditando) {
            this.produtoEditando = null;
            
            const botaoAdicionar = document.querySelector('.btn-primary');
            const botaoCancelar = document.querySelector('.btn-cancelar');
            
            if (botaoAdicionar) {
                botaoAdicionar.textContent = '✅ Adicionar Produto';
            }
            if (botaoCancelar) {
                botaoCancelar.style.display = 'none';
            }
        }
    }
    
    calcularPreviewLucro() {
        const preco = parseFloat(document.getElementById('novo-preco').value) || 0;
        const custo = parseFloat(document.getElementById('novo-custo').value) || 0;
        const previewElement = document.getElementById('preview-lucro');
        
        if (preco > 0 && custo > 0 && custo < preco) {
            const lucro = preco - custo;
            const margemLucro = ((lucro / preco) * 100).toFixed(1);
            previewElement.textContent = `R$ ${lucro.toFixed(2).replace('.', ',')} (${margemLucro}%)`;
            previewElement.style.color = '#38a169';
        } else {
            previewElement.textContent = 'R$ 0,00 (0%)';
            previewElement.style.color = '#718096';
        }
    }

    atualizarEstoque() {
        const lista = document.getElementById('estoque-lista');
        if (!lista) return;
        
        let html = '';
        
        this.produtos.forEach(produto => {
            const statusClass = produto.estoque === 0 ? 'sem-estoque' : 
                              produto.estoque <= 5 ? 'baixo-estoque' : 'normal';
            const margemLucro = ((produto.preco - produto.custo) / produto.preco * 100).toFixed(1);
            
            html += `
                <div class="produto-item ${statusClass}">
                    <div class="produto-info">
                        <div class="produto-nome">${produto.nome}</div>
                        <div class="produto-categoria">${produto.categoria}</div>
                        <div class="produto-margem">Margem: ${margemLucro}%</div>
                    </div>
                    <div class="produto-dados">
                        <div class="produto-estoque">
                            <span class="label">Estoque:</span>
                            <span class="valor ${statusClass}">${produto.estoque}</span>
                        </div>
                        <div class="produto-preco">
                            <span class="label">Preço:</span>
                            <span class="valor">R$ ${produto.preco.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                    <div class="produto-acoes">
                        <button onclick="sistema.ajustarEstoque(${produto.id}, 1)" class="btn-ajustar add" title="Adicionar 1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                        <button onclick="sistema.ajustarEstoque(${produto.id}, 5)" class="btn-ajustar add-bulk" title="Adicionar 5">
                            +5
                        </button>
                        <button onclick="sistema.ajustarEstoque(${produto.id}, -1)" class="btn-ajustar remove" title="Remover 1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html || '<div class="lista-vazia"><p>Nenhum produto cadastrado</p></div>';
        
        // Atualizar estatísticas do estoque
        this.atualizarEstatisticasEstoque();
    }
    
    atualizarEstatisticasEstoque() {
        const totalItens = this.produtos.reduce((total, produto) => total + produto.estoque, 0);
        const alertas = this.produtos.filter(produto => produto.estoque <= 5).length;
        const valorTotal = this.produtos.reduce((total, produto) => total + (produto.preco * produto.estoque), 0);
        const contadorProdutos = this.produtos.length;
        
        // Atualizar elementos da interface
        const totalItensEl = document.getElementById('total-itens-estoque');
        const alertasEl = document.getElementById('alertas-estoque');
        const valorInventarioEl = document.getElementById('valor-inventario');
        const contadorProdutosEl = document.getElementById('contador-produtos');
        
        if (totalItensEl) totalItensEl.textContent = totalItens;
        if (alertasEl) alertasEl.textContent = alertas;
        if (valorInventarioEl) valorInventarioEl.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
        if (contadorProdutosEl) contadorProdutosEl.textContent = `${contadorProdutos} ${contadorProdutos === 1 ? 'produto' : 'produtos'}`;
    }

    // Funções para estatísticas do dashboard executivo
    obterEstatisticasGerais() {
        const vendas = this.obterVendas();
        const hoje = new Date().toDateString();
        const vendasHoje = vendas.filter(venda => new Date(venda.data).toDateString() === hoje);
        
        // Estatísticas básicas
        const totalVendasHoje = vendasHoje.reduce((total, venda) => total + venda.totalVenda, 0);
        const totalLucroHoje = vendasHoje.reduce((total, venda) => total + venda.lucro, 0);
        const quantidadeVendasHoje = vendasHoje.length;
        
        // Produto mais vendido hoje
        const produtosVendidos = {};
        vendasHoje.forEach(venda => {
            venda.itens.forEach(item => {
                if (!produtosVendidos[item.nome]) {
                    produtosVendidos[item.nome] = 0;
                }
                produtosVendidos[item.nome] += item.quantidade;
            });
        });
        
        const produtoMaisVendido = Object.keys(produtosVendidos).reduce((a, b) => 
            produtosVendidos[a] > produtosVendidos[b] ? a : b, Object.keys(produtosVendidos)[0]
        ) || 'Nenhum';
        
        // Produtos com estoque baixo
        const produtosEstoqueBaixo = this.produtos.filter(p => p.estoque <= 5).length;
        
        return {
            totalVendasHoje,
            totalLucroHoje,
            quantidadeVendasHoje,
            produtoMaisVendido,
            produtosEstoqueBaixo,
            ticketMedio: quantidadeVendasHoje > 0 ? totalVendasHoje / quantidadeVendasHoje : 0
        };
    }

    obterVendasPorPeriodo(dias = 7) {
        const vendas = this.obterVendas();
        const hoje = new Date();
        const vendasPeriodo = [];
        
        for (let i = dias - 1; i >= 0; i--) {
            const data = new Date(hoje);
            data.setDate(data.getDate() - i);
            const dataString = data.toDateString();
            
            const vendasDia = vendas.filter(venda => 
                new Date(venda.data).toDateString() === dataString
            );
            
            const totalDia = vendasDia.reduce((total, venda) => total + venda.totalVenda, 0);
            const lucroDia = vendasDia.reduce((total, venda) => total + venda.lucro, 0);
            
            vendasPeriodo.push({
                data: data.toLocaleDateString('pt-BR'),
                vendas: totalDia,
                lucro: lucroDia,
                quantidade: vendasDia.length
            });
        }
        
        return vendasPeriodo;
    }

    obterProdutosMaisVendidos(limite = 5) {
        const vendas = this.obterVendas();
        const produtosVendidos = {};
        
        vendas.forEach(venda => {
            venda.itens.forEach(item => {
                if (!produtosVendidos[item.nome]) {
                    produtosVendidos[item.nome] = {
                        nome: item.nome,
                        quantidade: 0,
                        receita: 0
                    };
                }
                produtosVendidos[item.nome].quantidade += item.quantidade;
                produtosVendidos[item.nome].receita += item.preco * item.quantidade;
            });
        });
        
        return Object.values(produtosVendidos)
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, limite);
    }

    obterFormasPagamentoEstatisticas() {
        const vendas = this.obterVendas();
        const formasPagamento = {
            'dinheiro': { count: 0, total: 0 },
            'credito': { count: 0, total: 0 },
            'debito': { count: 0, total: 0 },
            'pix': { count: 0, total: 0 }
        };
        
        vendas.forEach(venda => {
            if (formasPagamento[venda.formaPagamento]) {
                formasPagamento[venda.formaPagamento].count++;
                formasPagamento[venda.formaPagamento].total += venda.totalVenda;
            }
        });
        
        return formasPagamento;
    }

    ajustarEstoque(id, quantidade) {
        const produto = this.produtos.find(p => p.id === id);
        const novoEstoque = produto.estoque + quantidade;
        
        if (novoEstoque < 0) {
            this.mostrarModal('Erro', 'Estoque não pode ser negativo!', 'error');
            return;
        }
        
        produto.estoque = novoEstoque;
        this.salvarProdutos();
        this.atualizarEstoque();
        this.carregarProdutosSelect();
    }

    filtrarEstoque() {
        const termo = document.getElementById('buscar-produto').value.toLowerCase();
        const itens = document.querySelectorAll('.estoque-item');
        
        itens.forEach(item => {
            const nome = item.querySelector('.estoque-nome').textContent.toLowerCase();
            const categoria = item.querySelector('.estoque-detalhes').textContent.toLowerCase();
            
            if (nome.includes(termo) || categoria.includes(termo)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    atualizarListaProdutos() {
        const lista = document.getElementById('produtos-lista');
        if (!lista) {
            console.error('Elemento produtos-lista não encontrado');
            return;
        }

        if (this.produtos.length === 0) {
            lista.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #b0b0b0;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom: 1rem; opacity: 0.5;">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    <h3 style="margin: 0 0 0.5rem 0; color: #666;">Nenhum produto cadastrado</h3>
                    <p style="margin: 0; font-size: 0.9rem;">Adicione produtos para começar a gerenciar seu inventário</p>
                </div>
            `;
            return;
        }

        this.exibirProdutosFiltrados();
    }

    exibirProdutosFiltrados() {
        const lista = document.getElementById('produtos-lista');
        const termoBusca = document.getElementById('search-produtos')?.value.toLowerCase() || '';

        let produtosFiltrados = this.produtos.filter(produto => 
            produto.nome.toLowerCase().includes(termoBusca) ||
            produto.categoria.toLowerCase().includes(termoBusca)
        );

        lista.innerHTML = produtosFiltrados.map(produto => {
            const categoria = this.getCategoriaIcon(produto.categoria);
            const estoqueStatus = produto.estoque <= 5 ? 'baixo' : produto.estoque === 0 ? 'zero' : 'normal';
            const margem = produto.preco > 0 ? ((produto.preco - produto.custo) / produto.preco * 100).toFixed(1) : 0;
            
            return `
                <div class="produto-card-novo" data-categoria="${produto.categoria}" data-estoque="${estoqueStatus}">
                    <div class="produto-header-novo">
                        <h4 class="produto-nome">${produto.nome}</h4>
                        <span class="produto-categoria-tag">${categoria} ${produto.categoria}</span>
                        <div class="produto-status">
                            <span class="status-badge ${estoqueStatus === 'zero' ? 'sem-estoque' : estoqueStatus === 'baixo' ? 'estoque-baixo' : 'estoque-ok'}">
                                ${estoqueStatus === 'zero' ? 'SEM ESTOQUE' : estoqueStatus === 'baixo' ? 'ESTOQUE BAIXO' : 'ESTOQUE OK'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="produto-preco-novo">
                        <span class="preco-simbolo">R$</span>
                        <span class="preco-valor">${produto.preco.toFixed(2).replace('.', ',')}</span>
                    </div>
                    
                    <div class="produto-detalhes-novo">
                        <div class="detalhe-row">
                            <span class="detalhe-label-novo">ESTOQUE</span>
                            <span class="detalhe-label-novo">CUSTO</span>
                            <span class="detalhe-label-novo">MARGEM</span>
                        </div>
                        <div class="detalhe-valores">
                            <span class="detalhe-valor-novo estoque-valor">${produto.estoque} un</span>
                            <span class="detalhe-valor-novo custo-valor">R$ ${produto.custo.toFixed(2).replace('.', ',')}</span>
                            <span class="detalhe-valor-novo margem-valor">${margem}%</span>
                        </div>
                    </div>
                    
                    <div class="produto-actions-novo">
                        <button class="btn-editar" onclick="editarProduto(${produto.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Editar
                        </button>
                        <button class="btn-estoque" onclick="abrirModalEstoque(${produto.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4m-4-4v8m0-8l3 3m-3-3l-3 3"/>
                            </svg>
                            Estoque
                        </button>
                        <button class="btn-excluir" onclick="excluirProduto(${produto.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                            </svg>
                            Excluir
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Função para obter ícone da categoria
    getCategoriaIcon(categoria) {
        const icons = {
            'cigarros': '🚬',
            'bebidas': '🥤',
            'doces': '🍬',
            'salgados': '🥨',
            'outros': '📦'
        };
        return icons[categoria.toLowerCase()] || '📦';
    }

    // Função para atualizar estatísticas de produtos
    atualizarEstatisticasProdutos() {
        const totalProdutos = document.getElementById('total-produtos');
        const produtosBaixoEstoque = document.getElementById('produtos-baixo-estoque');
        const valorTotalEstoque = document.getElementById('valor-total-estoque');
        
        if (totalProdutos) {
            totalProdutos.textContent = this.produtos.length;
        }
        
        if (produtosBaixoEstoque) {
            const baixoEstoque = this.produtos.filter(p => p.estoque <= 5 && p.estoque > 0).length;
            produtosBaixoEstoque.textContent = baixoEstoque;
        }
        
        if (valorTotalEstoque) {
            const valorTotal = this.produtos.reduce((total, produto) => {
                return total + (produto.custo * produto.estoque);
            }, 0);
            valorTotalEstoque.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
        }
    }

    removerProduto(id) {
        if (confirm('Tem certeza que deseja remover este produto?')) {
            this.produtos = this.produtos.filter(p => p.id !== id);
            this.salvarProdutos();
            this.carregarProdutosSelect();
            this.atualizarEstoque();
            this.atualizarListaProdutos();
            this.mostrarModal('Sucesso', 'Produto removido com sucesso!', 'success');
        }
    }

    imprimirComprovante(dadosVenda) {
        const { totalCompra, lucroVenda, itens, formaPagamento, valorRecebido } = dadosVenda;
        
        const formas = {
            'dinheiro': 'Dinheiro',
            'credito': 'Cartão de Crédito',
            'debito': 'Cartão de Débito',
            'pix': 'PIX'
        };
        
        const agora = new Date();
        const dataHora = agora.toLocaleString('pt-BR');
        
        let itensHtml = '';
        itens.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            itensHtml += `
                <tr>
                    <td style="padding: 5px; border-bottom: 1px solid #ddd;">${item.nome}</td>
                    <td style="padding: 5px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantidade}</td>
                    <td style="padding: 5px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${item.preco.toFixed(2).replace('.', ',')}</td>
                    <td style="padding: 5px; border-bottom: 1px solid #ddd; text-align: right;">R$ ${subtotal.toFixed(2).replace('.', ',')}</td>
                </tr>
            `;
        });
        
        let pagamentoInfo = '';
        if (formaPagamento === 'dinheiro' && valorRecebido) {
            const troco = valorRecebido - totalCompra;
            pagamentoInfo = `
                <p><strong>Valor Recebido:</strong> R$ ${valorRecebido.toFixed(2).replace('.', ',')}</p>
                <p><strong>Troco:</strong> R$ ${troco.toFixed(2).replace('.', ',')}</p>
            `;
        }
        
        const comprovanteHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprovante de Venda</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .info { margin-bottom: 15px; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th { background-color: #f5f5f5; padding: 8px; border: 1px solid #ddd; }
                    .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
                    .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>🚬 TABACARIA</h2>
                    <p>Comprovante de Venda</p>
                </div>
                
                <div class="info">
                    <p><strong>Data/Hora:</strong> ${dataHora}</p>
                    <p><strong>Forma de Pagamento:</strong> ${formas[formaPagamento]}</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Qtd</th>
                            <th>Preço Unit.</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itensHtml}
                    </tbody>
                </table>
                
                <div class="total">
                    <p><strong>TOTAL: R$ ${totalCompra.toFixed(2).replace('.', ',')}</strong></p>
                    ${pagamentoInfo}
                </div>
                
                <div class="footer">
                    <p>Obrigado pela preferência!</p>
                    <p>Sistema de Gestão - Tabacaria</p>
                </div>
            </body>
            </html>
        `;
        
        // Abrir nova janela para impressão
        const janelaImpressao = window.open('', '_blank');
        janelaImpressao.document.write(comprovanteHtml);
        janelaImpressao.document.close();
        
        // Aguardar carregamento e imprimir
        janelaImpressao.onload = function() {
            janelaImpressao.print();
            janelaImpressao.close();
        };
        
        // Mostrar toast de confirmação
        this.mostrarToast('🖨️ Comprovante enviado para impressão!', 'success');
    }

    mostrarToast(mensagem, tipo = 'success', duracao = 3000) {
        // Criar container de toast se não existir
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Criar toast
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        
        const iconMap = {
            success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`,
            error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
            warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="m12 17 .01 0"/></svg>`
        };
        
        toast.innerHTML = `
            <div class="toast-icon ${tipo}">
                ${iconMap[tipo]}
            </div>
            <div class="toast-content">
                <div class="toast-message">${mensagem}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remover após duração especificada
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duracao);
    }

    mostrarModalVenda(dadosVenda) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const { totalCompra, lucroVenda, itens, formaPagamento, valorRecebido } = dadosVenda;
        
        const formas = {
            'dinheiro': 'Dinheiro',
            'credito': 'Cartão de Crédito',
            'debito': 'Cartão de Débito',
            'pix': 'PIX'
        };
        
        let itensHtml = '';
        itens.forEach(item => {
            const subtotal = item.preco * item.quantidade;
            itensHtml += `
                <div class="venda-item-resumo">
                    <div class="item-info">
                        <span class="item-nome">${item.nome}</span>
                        <span class="item-detalhes">${item.quantidade}x R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <span class="item-subtotal">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
        });
        
        let pagamentoInfo = '';
        if (formaPagamento === 'dinheiro' && valorRecebido) {
            const troco = valorRecebido - totalCompra;
            pagamentoInfo = `
                <div class="pagamento-detalhes">
                    <div class="pagamento-row">
                        <span>Valor recebido:</span>
                        <span>R$ ${valorRecebido.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="pagamento-row troco">
                        <span>Troco:</span>
                        <span>R$ ${troco.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
            `;
        }
        
        modalBody.innerHTML = `
            <div class="notification-header success">
                <div class="notification-icon success">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                </div>
                <h3 class="notification-title">Venda Finalizada!</h3>
            </div>
            <div class="notification-body">
                <div class="venda-resumo">
                    <div class="resumo-section">
                        <h4 class="section-title">📦 Itens Vendidos</h4>
                        <div class="itens-lista">
                            ${itensHtml}
                        </div>
                    </div>
                    
                    <div class="resumo-section">
                        <h4 class="section-title">💰 Resumo Financeiro</h4>
                        <div class="financeiro-resumo">
                            <div class="resumo-row">
                                <span>Total da venda:</span>
                                <span class="valor-destaque">R$ ${totalCompra.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div class="resumo-row">
                                <span>Lucro obtido:</span>
                                <span class="lucro-destaque">R$ ${lucroVenda.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div class="resumo-row">
                                <span>Forma de pagamento:</span>
                                <span>${formas[formaPagamento]}</span>
                            </div>
                        </div>
                        ${pagamentoInfo}
                    </div>
                </div>
            </div>
            <div class="notification-actions">
                 <button class="btn-notification secondary" onclick="sistemaVendas.imprimirComprovante({totalCompra: ${totalCompra}, lucroVenda: ${lucroVenda}, itens: ${JSON.stringify(itens).replace(/"/g, '&quot;')}, formaPagamento: '${formaPagamento}', valorRecebido: ${valorRecebido}})">🖨️ Imprimir</button>
                 <button class="btn-notification primary" onclick="fecharModal()">OK</button>
             </div>
        `;
        
        modal.style.display = 'block';
        
        // Auto-fechar após 8 segundos
        setTimeout(() => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        }, 8000);
    }

    mostrarModal(titulo, mensagem, tipo) {
        const modal = document.getElementById('modal');
        const modalBody = document.getElementById('modal-body');
        
        const iconMap = {
            'success': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 6L9 17l-5-5"/>
            </svg>`,
            'error': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>`,
            'warning': `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`
        };
        
        const icon = iconMap[tipo] || '!';
        
        modalBody.innerHTML = `
            <div class="notification-header ${tipo}">
                <div class="notification-icon ${tipo}">${icon}</div>
                <h3 class="notification-title">${titulo}</h3>
            </div>
            <div class="notification-body">
                <p class="notification-message">${mensagem.replace(/\n/g, '<br>')}</p>
            </div>
            <div class="notification-actions">
                <button class="btn-notification primary" onclick="fecharModal()">OK</button>
            </div>
        `;
        
        modal.style.display = 'block';
        
        // Auto-fechar após 5 segundos para mensagens de sucesso
        if (tipo === 'success') {
            setTimeout(() => {
                if (modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            }, 5000);
        }
    }
    
    // Nova função para toast notifications
    mostrarToast(titulo, mensagem, tipo = 'success', duracao = 4000) {
        const container = document.getElementById('toast-container');
        const toastId = 'toast-' + Date.now();
        
        const iconMap = {
            'success': '✓',
            'error': '✕',
            'warning': '⚠'
        };
        
        const icon = iconMap[tipo] || '!';
        
        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        toast.id = toastId;
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${titulo}</div>
                <div class="toast-message">${mensagem}</div>
            </div>
            <button class="toast-close" onclick="removerToast('${toastId}')">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Auto-remover após a duração especificada
        setTimeout(() => {
            this.removerToast(toastId);
        }, duracao);
    }
    
    removerToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }
}

// Funções globais para os event handlers
function showTab(tabName) {
    // Ocultar todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover classe active de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    document.getElementById(tabName).classList.add('active');
    
    // Adicionar classe active ao botão correspondente
    event.target.classList.add('active');
}

// Função para ajustar quantidade
function adjustQuantity(change) {
    const quantidadeInput = document.getElementById('quantidade');
    let quantidade = parseInt(quantidadeInput.value) || 1;
    quantidade += change;
    
    if (quantidade < 1) quantidade = 1;
    
    quantidadeInput.value = quantidade;
    atualizarTotalItem();
}

// Função para atualizar total do item
function atualizarTotalItem() {
    const select = document.getElementById('produto-select');
    const quantidade = parseInt(document.getElementById('quantidade').value) || 1;
    const totalItemElement = document.getElementById('total-item');
    
    if (select.value && totalItemElement) {
        const produto = sistema.produtos.find(p => p.id == select.value);
        if (produto) {
            const total = produto.preco * quantidade;
            totalItemElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
        }
    } else if (totalItemElement) {
        totalItemElement.textContent = 'R$ 0,00';
    }
}

// Função para atualizar estatísticas do dashboard
function atualizarEstatisticas() {
    const stats = sistema.obterEstatisticasGerais();
    
    // Atualizar vendas hoje (quantidade)
    const vendasHojeElement = document.getElementById('vendas-hoje');
    if (vendasHojeElement) {
        vendasHojeElement.textContent = stats.quantidadeVendasHoje;
    }
    
    // Atualizar vendas hoje (valor)
    const vendasHojeValorElement = document.getElementById('vendas-hoje-valor');
    if (vendasHojeValorElement) {
        vendasHojeValorElement.textContent = `R$ ${stats.totalVendasHoje.toFixed(2).replace('.', ',')}`;
    }
    
    // Atualizar ticket médio
    const ticketMedioElement = document.getElementById('ticket-medio');
    if (ticketMedioElement) {
        ticketMedioElement.textContent = `R$ ${stats.ticketMedio.toFixed(0)}`;
    }
}

// Função para filtrar produtos
function filtrarProdutos(filtro, elemento = null) {
    const cards = document.querySelectorAll('.produto-card-novo');
    const tabs = document.querySelectorAll('.filter-tab-novo');
    
    // Atualizar tabs ativas
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Se elemento foi passado, usar ele; senão, usar event.target
    const targetElement = elemento || event.target;
    if (targetElement) {
        targetElement.classList.add('active');
    }
    
    cards.forEach(card => {
        const categoria = card.dataset.categoria;
        const estoque = card.dataset.estoque;
        
        let mostrar = true;
        
        switch(filtro) {
            case 'baixo-estoque':
                mostrar = estoque === 'baixo';
                break;
            case 'sem-estoque':
                mostrar = estoque === 'zero';
                break;
            case 'todos':
            default:
                mostrar = true;
                break;
        }
        
        card.style.display = mostrar ? 'block' : 'none';
    });
}

// Função para buscar produtos
function buscarProdutos() {
    // Chama o método do sistema para atualizar a lista filtrada
    sistema.exibirProdutosFiltrados();
}

function adicionarItem() {
    sistema.adicionarItem();
}

function selecionarPagamento(tipo) {
    sistema.selecionarPagamento(tipo);
}

function finalizarVenda() {
    sistema.finalizarVenda();
}

function adicionarProduto() {
    sistema.adicionarProduto();
}

function filtrarEstoque() {
    sistema.filtrarEstoque();
}

function filtrarRelatorio() {
    const dataInicio = document.getElementById('data-inicio').value;
    const dataFim = document.getElementById('data-fim').value;
    
    if (!dataInicio || !dataFim) {
        sistema.mostrarModal('Erro', 'Selecione as datas de início e fim!', 'error');
        return;
    }
    
    if (new Date(dataInicio) > new Date(dataFim)) {
        sistema.mostrarModal('Erro', 'Data de início deve ser anterior à data de fim!', 'error');
        return;
    }
    
    const vendas = sistema.obterVendas(dataInicio, dataFim);
    const resumo = sistema.calcularResumoFinanceiro(vendas);
    
    document.getElementById('vendas-hoje-valor').textContent = `R$ ${resumo.vendas.toFixed(2).replace('.', ',')}`;
    document.getElementById('gastos-hoje').textContent = `R$ ${resumo.custos.toFixed(2).replace('.', ',')}`;
    document.getElementById('lucro-hoje').textContent = `R$ ${resumo.lucro.toFixed(2).replace('.', ',')}`;
    
    sistema.atualizarHistoricoVendas(vendas);
}

function limparFiltro() {
    sistema.inicializarDatasRelatorio();
    sistema.atualizarRelatorios();
}

function limparFormulario() {
    sistema.limparFormulario();
}

function calcularPreviewLucro() {
    sistema.calcularMargemLucro();
    
    if (preco > 0 && custo > 0 && custo < preco) {
        const lucro = preco - custo;
        const margemLucro = ((lucro / preco) * 100).toFixed(1);
        profitValue.textContent = `${margemLucro}%`;
        profitPreview.style.display = 'block';
        
        // Cor baseada na margem
        if (margemLucro >= 30) {
            profitValue.style.color = '#155724'; // Verde escuro
        } else if (margemLucro >= 15) {
            profitValue.style.color = '#856404'; // Amarelo escuro
        } else {
            profitValue.style.color = '#721c24'; // Vermelho escuro
        }
    } else {
        profitPreview.style.display = 'none';
    }
}

function filtrarProdutos() {
    const busca = document.getElementById('buscar-produto').value.toLowerCase();
    const produtosFiltrados = sistema.produtos.filter(produto => 
        produto.nome.toLowerCase().includes(busca)
    );
    sistema.exibirProdutosFiltrados(produtosFiltrados);
}

function ordenarProdutos() {
    const criterio = document.getElementById('ordenar-produtos').value;
    let produtosOrdenados = [...sistema.produtos];
    
    switch(criterio) {
        case 'nome':
            produtosOrdenados.sort((a, b) => a.nome.localeCompare(b.nome));
            break;
        case 'preco':
            produtosOrdenados.sort((a, b) => b.preco - a.preco);
            break;
        case 'quantidade':
            produtosOrdenados.sort((a, b) => b.quantidade - a.quantidade);
            break;
    }
    
    sistema.exibirProdutosFiltrados(produtosOrdenados);
}

function editarProduto(id) {
    const produto = sistema.produtos.find(p => p.id === id);
    if (!produto) return;
    
    // Preencher formulário com dados do produto
    document.getElementById('produto-nome').value = produto.nome;
    document.getElementById('produto-preco').value = produto.preco;
    document.getElementById('produto-custo').value = produto.custo;
    document.getElementById('produto-estoque').value = produto.estoque || produto.quantidade;
    document.getElementById('produto-categoria').value = produto.categoria || 'outros';
    
    // Calcular margem de lucro
    sistema.calcularMargemLucro();
    
    // Marcar que estamos editando um produto
    sistema.produtoEditando = id;
    
    // Alterar interface para modo edição
    const botaoAdicionar = document.querySelector('.btn-primary');
    const botaoCancelar = document.querySelector('.btn-cancelar');
    
    if (botaoAdicionar) {
        botaoAdicionar.textContent = '✏️ Atualizar Produto';
    }
    if (botaoCancelar) {
        botaoCancelar.style.display = 'inline-block';
    }
    
    // Scroll para o formulário
    const formContainer = document.querySelector('.produto-form-container') || document.getElementById('produto-form');
    if (formContainer) {
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelarEdicao() {
    // Resetar modo de edição
    sistema.produtoEditando = null;
    
    // Restaurar interface
    const botaoAdicionar = document.querySelector('.btn-primary');
    const botaoCancelar = document.querySelector('.btn-cancelar');
    
    if (botaoAdicionar) {
        botaoAdicionar.textContent = '✅ Adicionar Produto';
    }
    if (botaoCancelar) {
        botaoCancelar.style.display = 'none';
    }
    
    // Limpar formulário
    limparFormulario();
}

function excluirProduto(id) {
    const produto = sistema.produtos.find(p => p.id === id);
    if (!produto) return;
    
    if (confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
        sistema.produtos = sistema.produtos.filter(p => p.id !== id);
        sistema.salvarDados();
        sistema.atualizarListaProdutos();
        sistema.atualizarEstoque();
        sistema.mostrarModal('Sucesso', `Produto "${produto.nome}" excluído com sucesso!`, 'success');
    }
}

function fecharModal() {
    document.getElementById('modal').style.display = 'none';
}

function removerToast(toastId) {
    const toast = document.getElementById(toastId);
    if (toast) {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// Função para baixar histórico em PDF
function baixarHistoricoPDF() {
    try {
        const vendas = sistema.obterVendas();
        
        if (vendas.length === 0) {
            sistema.mostrarToast('Aviso', 'Não há vendas para exportar!', 'warning');
            return;
        }
        
        // Criar conteúdo HTML para impressão
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const horaAtual = new Date().toLocaleTimeString('pt-BR');
        
        let htmlContent = `
            <html>
            <head>
                <title>Histórico de Vendas - Tabacaria</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .header h1 { color: #333; margin: 0; }
                    .header p { color: #666; margin: 5px 0; }
                    .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .summary h3 { margin-top: 0; color: #333; }
                    .venda { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
                    .venda-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                    .venda-data { font-weight: bold; color: #333; }
                    .venda-total { font-weight: bold; color: #2196F3; font-size: 1.1em; }
                    .venda-itens { margin: 10px 0; }
                    .item { margin: 5px 0; padding: 5px; background: #f9f9f9; border-radius: 3px; }
                    .venda-info { display: flex; justify-content: space-between; margin-top: 10px; }
                    .lucro { color: #4CAF50; font-weight: bold; }
                    .pagamento { color: #666; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📊 Histórico de Vendas - Tabacaria</h1>
                    <p>Relatório gerado em: ${dataAtual} às ${horaAtual}</p>
                    <p>Total de vendas: ${vendas.length}</p>
                </div>
        `;
        
        // Calcular resumo
        const totalVendas = vendas.reduce((sum, venda) => sum + (venda.totalVenda || 0), 0);
        const totalLucro = vendas.reduce((sum, venda) => sum + (venda.lucro || 0), 0);
        
        htmlContent += `
            <div class="summary">
                <h3>📈 Resumo Financeiro</h3>
                <p><strong>Total em Vendas:</strong> R$ ${totalVendas.toFixed(2).replace('.', ',')}</p>
                <p><strong>Total em Lucro:</strong> R$ ${totalLucro.toFixed(2).replace('.', ',')}</p>
                <p><strong>Margem de Lucro Média:</strong> ${((totalLucro / totalVendas) * 100).toFixed(1)}%</p>
            </div>
        `;
        
        // Adicionar cada venda
        vendas.forEach((venda, index) => {
            const dataVenda = new Date(venda.data).toLocaleDateString('pt-BR');
            const horaVenda = new Date(venda.data).toLocaleTimeString('pt-BR');
            
            htmlContent += `
                <div class="venda">
                    <div class="venda-header">
                        <span class="venda-data">🗓️ ${dataVenda} - ${horaVenda}</span>
                        <span class="venda-total">R$ ${(venda.totalVenda || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="venda-itens">
                        <strong>📦 Itens:</strong>
            `;
            
            venda.itens.forEach(item => {
                htmlContent += `
                    <div class="item">
                        ${item.nome || 'Produto'} - Qtd: ${item.quantidade || 0} - R$ ${(item.precoUnitario || 0).toFixed(2).replace('.', ',')} cada
                    </div>
                `;
            });
            
            htmlContent += `
                    </div>
                    <div class="venda-info">
                        <span class="pagamento">💳 ${sistema.formatarFormaPagamento(venda.formaPagamento || 'Não informado')}</span>
                        <span class="lucro">💰 Lucro: R$ ${(venda.lucro || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
            `;
        });
        
        htmlContent += `
            </body>
            </html>
        `;
        
        // Abrir nova janela para impressão
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Aguardar carregamento e imprimir
        printWindow.onload = function() {
            setTimeout(() => {
                printWindow.print();
            }, 500);
        };
        
        sistema.mostrarToast('Sucesso', 'PDF gerado! Use Ctrl+P para salvar como PDF.', 'success');
        
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        sistema.mostrarToast('Erro', 'Erro ao gerar PDF do histórico!', 'error');
    }
}

// Fechar modal clicando fora dele
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Funções para dashboard executivo
function atualizarDashboardExecutivo() {
    const stats = sistema.obterEstatisticasGerais();
    const vendasPeriodo = sistema.obterVendasPorPeriodo(7);
    const produtosMaisVendidos = sistema.obterProdutosMaisVendidos(5);
    const formasPagamento = sistema.obterFormasPagamentoEstatisticas();
    
    // Atualizar cards de estatísticas
    document.getElementById('vendas-hoje-exec').textContent = `R$ ${stats.totalVendasHoje.toFixed(2).replace('.', ',')}`;
    document.getElementById('lucro-hoje-exec').textContent = `R$ ${stats.totalLucroHoje.toFixed(2).replace('.', ',')}`;
    document.getElementById('ticket-medio').textContent = `R$ ${stats.ticketMedio.toFixed(2).replace('.', ',')}`;
    document.getElementById('produtos-baixo-estoque').textContent = stats.produtosEstoqueBaixo;
    
    // Atualizar gráfico de vendas (simulado com texto)
    const graficoVendas = document.getElementById('grafico-vendas');
    if (graficoVendas) {
        let htmlGrafico = '<div class="grafico-simples">';
        vendasPeriodo.forEach(dia => {
            const altura = Math.max(10, (dia.vendas / Math.max(...vendasPeriodo.map(d => d.vendas))) * 100);
            htmlGrafico += `
                <div class="barra-grafico" style="height: ${altura}%" title="${dia.data}: R$ ${dia.vendas.toFixed(2)}">
                    <span class="data-grafico">${dia.data.split('/')[0]}/${dia.data.split('/')[1]}</span>
                </div>
            `;
        });
        htmlGrafico += '</div>';
        graficoVendas.innerHTML = htmlGrafico;
    }
    
    // Atualizar lista de produtos mais vendidos
    const listaProdutos = document.getElementById('produtos-mais-vendidos');
    if (listaProdutos) {
        let htmlProdutos = '';
        produtosMaisVendidos.forEach((produto, index) => {
            htmlProdutos += `
                <div class="produto-ranking">
                    <span class="ranking-posicao">${index + 1}º</span>
                    <span class="ranking-nome">${produto.nome}</span>
                    <span class="ranking-quantidade">${produto.quantidade} vendidos</span>
                    <span class="ranking-receita">R$ ${produto.receita.toFixed(2).replace('.', ',')}</span>
                </div>
            `;
        });
        listaProdutos.innerHTML = htmlProdutos || '<p>Nenhuma venda registrada</p>';
    }
}

// Event listeners para inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para formulário de produtos
    const produtoForm = document.getElementById('produto-form');
    if (produtoForm) {
        produtoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sistema.adicionarProduto();
        });
        
        // Event listeners para cálculo de margem
        const custoInput = document.getElementById('custo-produto');
        const precoInput = document.getElementById('preco-produto');
        
        if (custoInput) custoInput.addEventListener('input', () => sistema.calcularMargemLucro());
        if (precoInput) precoInput.addEventListener('input', () => sistema.calcularMargemLucro());
    }
    
    // Event listener para busca de produtos
    const searchInput = document.getElementById('search-produtos');
    if (searchInput) {
        searchInput.addEventListener('input', buscarProdutos);
    }
});

// Inicializar sistema
const sistema = new SistemaTabacaria();

// Teste das notificações após carregamento
setTimeout(() => {
    console.log('Testando notificações...');
    atualizarEstatisticas();
    sistema.mostrarToast('Sistema', 'Aplicação carregada com sucesso!', 'success');
}, 1000);

// Atualizar dashboard executivo quando a aba for mostrada
function showTab(tabName) {
    // Ocultar todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remover classe active de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    document.getElementById(tabName).classList.add('active');
    
    // Adicionar classe active ao botão correspondente
    event.target.classList.add('active');
    
    // Atualizar dashboard executivo se for a aba selecionada
    if (tabName === 'dashboard') {
        setTimeout(() => atualizarDashboardExecutivo(), 100);
    }
}

// Função para abrir modal de ajuste de estoque
function abrirModalEstoque(id) {
    const produto = sistema.produtos.find(p => p.id === id);
    if (!produto) return;
    
    const quantidade = prompt(`Ajustar estoque de "${produto.nome}"\nEstoque atual: ${produto.estoque} unidades\n\nDigite a nova quantidade:`, produto.estoque);
    
    if (quantidade !== null && quantidade !== '') {
        const novaQuantidade = parseInt(quantidade);
        if (!isNaN(novaQuantidade) && novaQuantidade >= 0) {
            produto.estoque = novaQuantidade;
            sistema.salvarProdutos();
            sistema.exibirProdutosFiltrados();
            sistema.mostrarToast('Estoque atualizado com sucesso!', 'success');
        } else {
            sistema.mostrarModal('Erro', 'Por favor, digite um número válido maior ou igual a zero.', 'error');
        }
    }
}

// Função global para ajustar estoque (compatibilidade)
function ajustarEstoque(id, quantidade) {
    sistema.ajustarEstoque(id, quantidade);
}

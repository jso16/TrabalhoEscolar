document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("cliente-form");
    const clientesList = document.getElementById("clientes-list");
    const senhaContainer = document.getElementById("senha-container");
    let senhaDesbloqueada = false;
    let storedClientes = JSON.parse(localStorage.getItem("clientes")) || [];

    document.getElementById("desbloquear-btn").addEventListener("click", function() {
        desbloquearComSenha();
    });

    document.getElementById("senha").addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            desbloquearComSenha();
        }
    });

    function desbloquearComSenha() {
        const senhaDigitada = document.getElementById("senha").value.trim();
        if (senhaDigitada === "12345") {
            senhaDesbloqueada = true;
            alert("Senha correta. Funcionalidades desbloqueadas!");
            desbloquearCampos();
        } else {
            alert("Senha incorreta. Tente novamente.");
        }
    }

    function desbloquearCampos() {
        const inputs = document.querySelectorAll("#cliente-form input, #cliente-form select");
        inputs.forEach(input => {
            input.disabled = !senhaDesbloqueada;
        });

        const buttons = document.querySelectorAll("#cliente-form button");
        buttons.forEach(button => {
            button.disabled = !senhaDesbloqueada;
        });

        document.getElementById("export-btn").disabled = !senhaDesbloqueada;
        document.getElementById("import-btn").disabled = !senhaDesbloqueada;
        document.getElementById("pesquisar-cpf-btn").disabled = !senhaDesbloqueada;
        document.getElementById("limpar-todos-btn").disabled = !senhaDesbloqueada;
    }

    // Preenche a tabela com os clientes armazenados localmente
    storedClientes.forEach(cliente => {
        const newRow = createRow(cliente);
        clientesList.appendChild(newRow);
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        if (!senhaDesbloqueada) {
            alert("Por favor, desbloqueie as funcionalidades com a senha.");
            return;
        }
        
        const cpf = document.getElementById("cpf").value.replace(/[^\d]/g, '');
        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const telefone = document.getElementById("telefone").value;
        const endereco = document.getElementById("endereco").value;
        const bairro = document.getElementById("bairro").value;
        const cep = document.getElementById("cep").value;
        const cidade = document.getElementById("cidade").value;
        const estado = document.getElementById("estado").value;
        const data = document.getElementById("data").value;
        const hora = document.getElementById("hora").value;

        const cliente = {
            cpf,
            nome,
            email,
            telefone,
            endereco,
            bairro,
            cep,
            cidade,
            estado,
            data,
            hora
        };

        storedClientes.push(cliente);
        localStorage.setItem("clientes", JSON.stringify(storedClientes));

        const newRow = createRow(cliente);
        clientesList.appendChild(newRow);

        form.reset();
    });

    function createRow(cliente) {
        const row = document.createElement("tr");
        
        Object.keys(cliente).forEach(key => {
            const cell = document.createElement("td");
            cell.textContent = cliente[key];
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Excluir";
        deleteButton.addEventListener("click", function() {
            storedClientes = storedClientes.filter(c => c.cpf !== cliente.cpf);
            localStorage.setItem("clientes", JSON.stringify(storedClientes));
            row.remove();
        });
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        return row;
    }

    document.getElementById("export-btn").addEventListener("click", function() {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(storedClientes);
        XLSX.utils.book_append_sheet(wb, ws, "Clientes");
        XLSX.writeFile(wb, "clientes.xlsx");
    });

    document.getElementById("import-btn").addEventListener("change", function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const importedClientes = XLSX.utils.sheet_to_json(worksheet);

            importedClientes.forEach(cliente => {
                storedClientes.push(cliente);
                const newRow = createRow(cliente);
                clientesList.appendChild(newRow);
            });

            localStorage.setItem("clientes", JSON.stringify(storedClientes));
        };
        reader.readAsArrayBuffer(file);
    });

    document.getElementById("limpar-todos-btn").addEventListener("click", function() {
        const confirmacao = confirm("Tem certeza de que deseja limpar todos os dados?");
        if (confirmacao) {
            localStorage.removeItem("clientes");
            while (clientesList.firstChild) {
                clientesList.removeChild(clientesList.firstChild);
            }
            storedClientes = [];
        }
    });

    document.getElementById("pesquisar-cpf-btn").addEventListener("click", function() {
        const cpfToSearch = prompt("Digite o CPF a ser pesquisado:");
        if (!cpfToSearch) return;

        const rows = clientesList.querySelectorAll("tr");
        rows.forEach(row => {
            const cpfCell = row.querySelector("td:first-child");
            const cpfValue = cpfCell.innerText.replace(/[^\d]/g, '');
            if (cpfValue === cpfToSearch.replace(/[^\d]/g, '')) {
                row.style.display = ""; // Exibir a linha se o CPF for encontrado
            } else {
                row.style.display = "none"; // Ocultar a linha se o CPF não for encontrado
            }
        });

        const mostrarTodosBtn = document.createElement("button");
        mostrarTodosBtn.textContent = "Mostrar Todos";
        mostrarTodosBtn.id = "mostrar-todos-btn";
        document.getElementById("clientes-container").appendChild(mostrarTodosBtn);
        mostrarTodosBtn.addEventListener("click", mostrarTodosClientes);
    });

    function mostrarTodosClientes() {
        const rows = clientesList.querySelectorAll("tr");
        rows.forEach(row => {
            row.style.display = "";
        });
        document.getElementById("mostrar-todos-btn").remove();
    }
});

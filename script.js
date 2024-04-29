document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("cliente-form");
    const clientesList = document.getElementById("clientes-list");
    const senhaContainer = document.getElementById("senha-container");
    let senhaDesbloqueada = false;
    let storedClientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const telegramToken = 'SEU_TOKEN_DO_BOT';
    const telegramChatId = 'ID_DO_CHAT';

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
        if (senhaDigitada === "12345") { // Substitua "12345" pela sua senha desejada
            senhaDesbloqueada = true;
            alert("Senha correta. Funcionalidades desbloqueadas!");
            desbloquearCampos();
        } else {
            alert("Senha incorreta. Tente novamente.");
        }
    }

    function desbloquearCampos() {
        const inputs = document.querySelectorAll("#cliente-form input");
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
        const endereco = document.getElementById("endereco").value || "-";
        const cidade = document.getElementById("cidade").value || "-";
        const estado = document.getElementById("estado").value || "-";

        const cliente = {
            cpf: cpf,
            nome: nome,
            email: email,
            telefone: telefone,
            endereco: endereco,
            cidade: cidade,
            estado: estado
        };

        const newRow = createRow(cliente);
        clientesList.appendChild(newRow);

        storedClientes.push(cliente);
        localStorage.setItem("clientes", JSON.stringify(storedClientes));

        form.reset();
    });

    clientesList.addEventListener("click", function(event) {
        if (event.target.classList.contains("delete-btn")) {
            const row = event.target.closest("tr");
            const cpf = row.querySelector("td:first-child").innerText;
            const index = storedClientes.findIndex(cliente => cliente.cpf === cpf);
            storedClientes.splice(index, 1);
            localStorage.setItem("clientes", JSON.stringify(storedClientes));
            row.remove();
        }
    });

    document.getElementById("export-btn").addEventListener("click", function() {
        exportToExcel();
    });

    document.getElementById("import-btn").addEventListener("change", function(event) {
        importFromExcel(event);
    });

    document.getElementById("pesquisar-cpf-btn").addEventListener("click", function() {
        const cpfToSearch = prompt("Digite o CPF a ser pesquisado:");
        if (!cpfToSearch) return;

        const rows = clientesList.querySelectorAll("tr");
        rows.forEach(row => {
            const cpfCell = row.querySelector("td:first-child");
            const cpfValue = cpfCell.innerText.replace(/[^\d]/g, '');
            if (cpfValue === cpfToSearch.replace(/[^\d]/g, '')) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });

        const mostrarTodosBtn = document.createElement("button");
        mostrarTodosBtn.textContent = "Mostrar Todos";
        mostrarTodosBtn.id = "mostrar-todos-btn";
        document.getElementById("clientes-container").appendChild(mostrarTodosBtn);
        mostrarTodosBtn.addEventListener("click", mostrarTodosClientes);
    });

    document.getElementById("limpar-todos-btn").addEventListener("click", function() {
        if (confirm("Tem certeza que deseja limpar todos os dados cadastrados?")) {
            localStorage.removeItem("clientes");
            storedClientes = [];
            while (clientesList.firstChild) {
                clientesList.removeChild(clientesList.firstChild);
            }
        }
    });

    document.getElementById("enviar-feedback-btn").addEventListener("click", function() {
        const feedbackMessage = document.getElementById("feedback-message").value;

        fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: feedbackMessage
            })
        })
        .then(response => {
            if (response.ok) {
                alert("Feedback enviado com sucesso para o Telegram!");
            } else {
                alert("Não foi possivel enviar a mensagem, ainda é necessário a configuração de uma API para o funcionamento seguro desta função.");
            }
        })
        .catch(error => {
            console.error('Erro ao enviar feedback para o Telegram:', error);
            alert(Não foi possivel enviar a mensagem, ainda é necessário a configuração de uma API para o funcionamento seguro desta função.");
        });
    });

    function mostrarTodosClientes() {
        const rows = clientesList.querySelectorAll("tr");
        rows.forEach(row => {
            row.style.display = "";
        });
        document.getElementById("mostrar-todos-btn").remove();
    }

    function exportToExcel() {
        const data = [["CPF", "Nome Completo", "E-mail", "Telefone", "Endereço", "Cidade", "Estado"]];

        storedClientes.forEach(cliente => {
            const rowData = [];
            Object.values(cliente).forEach(value => {
                rowData.push(value);
            });
            data.push(rowData);
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Clientes");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "clientes.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function importFromExcel(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            const formattedData = jsonData.map(row => ({
                cpf: row["CPF"] || "",
                nome: row["Nome Completo"] || "",
                email: row["E-mail"] || "",
                telefone: row["Telefone"] || "",
                endereco: row["Endereço"] || "-",
                cidade: row["Cidade"] || "-",
                estado: row["Estado"] || "-"
            }));

            storedClientes = formattedData;
            localStorage.setItem("clientes", JSON.stringify(storedClientes));

            clientesList.innerHTML = ""; // Limpa a tabela antes de importar os novos dados
            storedClientes.forEach(cliente => {
                const newRow = createRow(cliente);
                clientesList.appendChild(newRow);
            });
        };
        reader.readAsArrayBuffer(file);
    }

    function createRow(cliente) {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${cliente.cpf}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone}</td>
            <td>${cliente.endereco}</td>
            <td>${cliente.cidade}</td>
            <td>${cliente.estado}</td>
            <td><button class="delete-btn">Excluir</button></td>
        `;
        return newRow;
    }
    
});

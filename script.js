document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("cliente-form");
    const clientesList = document.getElementById("clientes-list");
    const senhaContainer = document.getElementById("senha-container");
    let senhaDesbloqueada = false;

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
        if (senhaDigitada === "12345") { // Substitua "senha123" pela sua senha desejada
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
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        if (!senhaDesbloqueada) {
            alert("Por favor, desbloqueie as funcionalidades com a senha.");
            return;
        }
        
        const cpf = document.getElementById("cpf").value.replace(/[^\d]/g, ''); // Remover caracteres não numéricos
        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const telefone = document.getElementById("telefone").value;
        const endereco = document.getElementById("endereco").value || "-";
        const cidade = document.getElementById("cidade").value || "-";
        const estado = document.getElementById("estado").value || "-";

        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${cpf}</td>
            <td>${nome}</td>
            <td>${email}</td>
            <td>${telefone}</td>
            <td>${endereco}</td>
            <td>${cidade}</td>
            <td>${estado}</td>
            <td><button class="delete-btn">Excluir</button></td>
        `;

        clientesList.appendChild(newRow);

        form.reset();
    });

    clientesList.addEventListener("click", function(event) {
        if (event.target.classList.contains("delete-btn")) {
            event.target.parentElement.parentElement.remove();
        }
    });

    clientesList.addEventListener("mouseover", function(event) {
        if (event.target.tagName === "TD") {
            event.target.parentElement.classList.add("hovered");
        }
    });

    clientesList.addEventListener("mouseout", function(event) {
        if (event.target.tagName === "TD") {
            event.target.parentElement.classList.remove("hovered");
        }
    });

    document.getElementById("pesquisar-cpf-btn").addEventListener("click", function() {
        const cpfToSearch = prompt("Digite o CPF a ser pesquisado:");
        if (!cpfToSearch) return;

        const rows = clientesList.querySelectorAll("tr");
        rows.forEach(row => {
            const cpfCell = row.querySelector("td:first-child");
            const cpfValue = cpfCell.innerText.replace(/[^\d]/g, ''); // Remover caracteres não numéricos
            if (cpfValue === cpfToSearch.replace(/[^\d]/g, '')) {
                row.style.display = ""; // Mostra a linha
            } else {
                row.style.display = "none"; // Esconde a linha
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
            row.style.display = ""; // Mostra todas as linhas
        });
        document.getElementById("mostrar-todos-btn").remove();
    }

    document.getElementById("export-btn").addEventListener("click", function() {
        const rows = clientesList.querySelectorAll("tr");
        const data = [["CPF", "Nome Completo", "E-mail", "Telefone", "Endereço", "Cidade", "Estado"]];

        rows.forEach(row => {
            const rowData = [];
            row.querySelectorAll("td:not(:last-child)").forEach(cell => { // Exclui a última célula (Excluir)
                rowData.push(cell.innerText);
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
    });

    document.getElementById("import-btn").addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            clientesList.innerHTML = "";

            jsonData.forEach(item => {
                const newRow = document.createElement("tr");
                newRow.innerHTML = `
                    <td>${item.CPF}</td>
                    <td>${item["Nome Completo"]}</td>
                    <td>${item["E-mail"]}</td>
                    <td>${item.Telefone}</td>
                    <td>${item.Endereço || "-"}</td>
                    <td>${item.Cidade || "-"}</td>
                    <td>${item.Estado || "-"}</td>
                    <td><button class="delete-btn">Excluir</button></td>
                `;
                clientesList.appendChild(newRow);
            });
        };
        reader.readAsArrayBuffer(file);
    });
});


const app = document.getElementById('app');
const apiURL = "https://bank-bankend.onrender.com"
let accessToken = localStorage.getItem('accessToken')
let bankAccounts = []
let transactions = []

const renderLogin = async () => {
  app.innerHTML = `
    <div class="container">
      <h1 align="center">Нэвтрэх</h1>
      <p>Сайн байна уу. Хэрэв та бүртгэлтэй бол өөрийн нэр нууц үгээр нэвтэрч болно. Хэрэв та бүртгэлгүй бол одоо байгаа нэвтрэх хэсгээр өөрийн нэр нууц үгийг зохион нэвтрэх болон бүртгүүлэхийг хамтад нь хийх боломжтой.</p>
      <form id="login-form">
        <label htmlFor="username">Нэр</label>
        <input type="text" id="username" placeholder="Username" required>
        <label htmlFor="password">Нууц үг</label>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Нэвтрэх</button>
      </form>
    </div>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(apiURL + "/auth/login", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      })
    })

    if (!response.ok) {
      alert("Нууц үг буруу байна.")
    } else {
      const data = await response.json();
      console.log(data.accessToken)
      localStorage.setItem("accessToken", data.accessToken);
      accessToken = localStorage.getItem("accessToken")
      fetchInfo()
    }

  });
};


const fetchInfo = async () => {
  const bankAccountResponse = await fetch(apiURL + "/bankAccount", {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
  })
  if (bankAccountResponse.status === 403) {
    renderLogin();
  } else {
    renderHome();
  }

}

const renderHome = async () => {
  app.innerHTML = `
    <div class="container">
      <div id="header">
        <div class="header-element" id="my-bank-accounts">Миний данснууд</div>
        <div class="header-element" id="create-account">Данс үүсгэх</div>
        <div class="header-element" id="transactions">Гүйлгээний мэдээлэл</div>
        <div class="header-element" id="make-transaction">Гүйлгээ хийх</div>
        <div><button id="logout-button">Гарах</button></div>
      </div>
      <div id="main-content">
          <h4>Сайн байна уу</h4>
          <p>Танд манай апп-аар өөрийн дансны мэдээлэл болон гүйлгээнийхээ мэдээллийг харах боломжтойгоос гадна шинэ данс нээх (нээсэн данс бүр 100'000₮ ийн үлдэгдэлтэй) болон өөр дансууд руу гүйлгээ хийх боломжтой.</p>
      </div>
    <div> 
  `

  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", () => {
    logout();
    fetchInfo();
  })
  const myAccountsSectionButton = document.getElementById("my-bank-accounts");
  const createAccountSectionButton = document.getElementById("create-account")
  const transactionsSectionButton = document.getElementById("transactions");
  const makeTransactionSectionButton = document.getElementById("make-transaction");

  const mainContentDiv = document.getElementById("main-content");

  myAccountsSectionButton.addEventListener("click", async () => {
    await renderMyAccounts(mainContentDiv);
  })
  createAccountSectionButton.addEventListener("click", async () => {
    await renderCreateAccount(mainContentDiv);
  })
  transactionsSectionButton.addEventListener("click", async () => {
    await renderTransactions(mainContentDiv);
  })
  makeTransactionSectionButton.addEventListener("click", async () => {
    await renderMakeTransaction(mainContentDiv);
  })
}

const renderMyAccounts = async (div) => {
  let bankAccounts = null
  const response = await fetch(apiURL + "/bankAccount", {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
  })

  if (response.status === 403) {
    renderLogin();
    return;
  } else {
    if (response.status !== 404) {
      const data = await response.json();
      bankAccounts = data;
    }
  }

  if (!bankAccounts) {
    div.innerHTML = `
      <p>Таньд одоогоор банкны данс байхгүй байна.</p>
      <p>Данс нээх хэсэг рүү орж дансаа нээнэ үү.</p>
    `
  } else {
    div.innerHTML = ""
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create header row
    const headerRow = document.createElement('tr');
    const headers = ['Дансны дугаар', 'Банк', 'Үлдэгдэл'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Create rows for each account
    bankAccounts.forEach(account => {
        const row = document.createElement('tr');

        const accountNumberCell = document.createElement('td');
        accountNumberCell.textContent = account.bankAccountNumber;

        const bankLogoCell = document.createElement('td');
        const bankLogo = document.createElement('img');
        if (account.bankId === "664c5faef70414a0896a95e6") {
            bankLogo.src = apiURL + "/khanbank.png";
        } else if (account.bankId === "664c5fc4f70414a0896a95e9") {
            bankLogo.src = apiURL + "/golomtbank.jpg";
        } else if (account.bankId === "664c5fd9f70414a0896a95ec") {
            bankLogo.src = apiURL + "/tdbbank.png";
        } else if (account.bankId === "664c5fe9f70414a0896a95ef") {
            bankLogo.src = apiURL + "/xacbank.png";
        }
        bankLogoCell.appendChild(bankLogo);

        const balanceCell = document.createElement('td');
        balanceCell.textContent = `${account.balance} ₮`;

        row.appendChild(accountNumberCell);
        row.appendChild(bankLogoCell);
        row.appendChild(balanceCell);

        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    div.appendChild(table);
  }

}

const renderCreateAccount = async (div) => {
  div.innerHTML = `
    <h2>Данс нээх</h2>
    <form id="new-bank-account-form">
      <label for="bank">Банкаа сонгоно уу</label>
      <select id="bank" name="bank" required>
        <option value="664c5faef70414a0896a95e6">Хаан Банк</option>
        <option value="664c5fc4f70414a0896a95e9">Голомт Банк</option>
        <option value="664c5fd9f70414a0896a95ec">Худалдаа Хөгжилийн Банк</option>
        <option value="664c5fe9f70414a0896a95ef">Хас Банк</option>
      </select>
      <label for="bankAccountNumber">Дансны дугаараа зохионо уу</label>
      <input type="text" id="bankAccountNumber" placeholder="Дансны дугаар" minlength="8" required></input>
      <button type="submit">Данс үүсгэх</button>
    </form>

  `
  const form = document.getElementById("new-bank-account-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bankId = document.getElementById("bank").value;
    const bankAccountNumber = document.getElementById("bankAccountNumber").value;

    
    const response = await fetch(apiURL + "/bankAccount", {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // Include token if needed for authentication
        },
        body: JSON.stringify({
            bankAccountNumber,
            bankId // Replace with actual bankId
        })
    });


    if (!response.ok) {
        const data = await response.json();
        console.log(data);
        fetchInfo();
    } else {
      const data = await response.json();
      alert(`Таны ${data.bankAccountNumber} дугаартай данс амжилттай үүслээ.`);
      renderMyAccounts(div);
    }
    // Optionally, redirect or update the UI
  
  })
}

const filterTransactions = (transactions, searchTerm) => {
  return transactions.filter(transaction => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      transaction.date.toLowerCase().includes(searchTermLower) ||
      transaction.senderId.toLowerCase().includes(searchTermLower) ||
      transaction.receiverId.toLowerCase().includes(searchTermLower) ||
      transaction.transactionValue.toLowerCase().includes(searchTermLower) ||
      transaction.userBankId.toLowerCase().includes(searchTermLower) ||
      transaction.otherBankId.toLowerCase().includes(searchTermLower) ||
      transaction.transactionType.toLowerCase().includes(searchTermLower)
    );
  });
};


const renderTransactions = async (div) => {

  div.innerHTML = ""
  const label = document.createElement("label");
  label.textContent = "Хайлт хийх: "
  label.htmlFor = "search-bar"
  const searchBar = document.createElement("input");
  searchBar.type = "text";
  searchBar.id = "search-bar";
  searchBar.placeholder = "Хайх утгаа оруулна уу"
  div.appendChild(label);
  div.appendChild(searchBar)

  let transactions = null
  const response = await fetch(apiURL + "/transaction", {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
  })

  if (response.status === 403) {
    renderLogin();
    return;
  } else {
    if (response.status !== 404) {
      const data = await response.json();
      transactions = data;
    }
  }

  if (transactions.length === 0) {
    div.innerHTML = `
      <p>Таньд хийсэн гүйлгээ байхгүй байна.</p>
    `
  } else {
    const transactionsContainer = document.createElement("div");
    div.appendChild(transactionsContainer)
    renderTransactionsElement(transactions, transactionsContainer)
    searchBar.addEventListener("input", (e) => {
      const searchTerm = event.target.value;
      let filteredTransactions = filterTransactions(transactions, searchTerm);
      console.log(filteredTransactions)
      renderTransactionsElement(filteredTransactions, transactionsContainer)
    })
  }
}


const renderTransactionsElement = (transactions, div) => {
  div.innerHTML = ""
  const table = document.createElement('table');
    table.className = 'transactions-table';

    const headerRow = document.createElement('tr');
    const headers = ['Огноо', 'Шилжүүлсэн дансны банк', 'Шилжүүлсэн данс', 'Хүлээн авсан дансны банк', 'Хүлээн авсан данс', 'Хэмжээ', 'Мөнгөн тэмдэгт', 'Гүйлгээний утга', 'Гүйлгээний төрөл'];
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = header;
      headerRow.appendChild(td);
    });
    table.appendChild(headerRow);

    transactions.forEach(transaction => {
      const row = document.createElement('tr');

      const date = new Date(transaction.date).toLocaleString();
      const typeClass = transaction.transactionType === 'Орлого' ? 'transaction-positive' : 'transaction-negative';

      let data;

      if (transaction.transactionType === "Орлого") {
        row.className = "transaction-positive"
        data = [
          date,
          transaction.otherBankId,
          transaction.senderId,
          transaction.userBankId,
          transaction.receiverId,
          transaction.amount,
          transaction.moneyType,
          transaction.transactionValue,
          transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)
        ];
      } else if (transaction.transactionType === "Зарлага") {
        row.className = "transaction-negative"
        data = [
          date,
          transaction.userBankId,
          transaction.senderId,
          transaction.otherBankId,
          transaction.receiverId,
          transaction.amount,
          transaction.moneyType,
          transaction.transactionValue,
          transaction.transactionType
        ];
      }


      for (let i = 0; i < data.length; i++) {
        const td = document.createElement("td");
        if (i === 1 || i === 3) {
          const img = document.createElement("img");
          if (data[i] === "664c5faef70414a0896a95e6") {
            img.src = apiURL + "/khanbank.png";
          } else if (data[i] === "664c5fc4f70414a0896a95e9") {
              img.src = apiURL + "/golomtbank.jpg";
          } else if (data[i] === "664c5fd9f70414a0896a95ec") {
              img.src = apiURL + "/tdbbank.png";
          } else if (data[i] === "664c5fe9f70414a0896a95ef") {
              img.src = apiURL + "/xacbank.png";
          }
          td.appendChild(img)
        } else {
          td.textContent = data[i]
        }

        td.className = typeClass
        row.appendChild(td);
      }

      table.appendChild(row);
    });
    div.appendChild(table)
}

const renderMakeTransaction = async (div) => {
  let myAccounts;
  div.innerHTML = ""
  const upperText = document.createElement("h4");
  upperText.textContent = "Гүйлгээ хийх";
  const bankAccountsResponse = await fetch(apiURL + "/bankAccount", {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
  })
  if (bankAccountsResponse.status === 403) {
    renderLogin();
    return;
  } else {
    if (bankAccountsResponse.status !== 404) {
      const data = await bankAccountsResponse.json();
      myAccounts = data;
    } else {
      alert("Таньд бүртгэлтэй данс байхгүй байна. Та эхлээд дансаа нээнэ үү.")
      renderCreateAccount();
      return;
    }
  }

  //div.innerHTML = JSON.stringify(myAccounts) myAccounts are ready
  const form = document.createElement("form");
  const fromAccountLabel = document.createElement("label");
  fromAccountLabel.textContent = "Аль данснаас шилжүүлэх"
  const fromAccountSelect = document.createElement("select");
  fromAccountSelect.required = true;
  myAccounts.forEach(account => {
    const option = document.createElement("option");
    option.value = account.bankAccountNumber;
    let bankName;
    if (account.bankId === "664c5faef70414a0896a95e6") {
      bankName = "Хаан Банк"
    } else if (account.bankId === "664c5fc4f70414a0896a95e9") {
      bankName = "Голомт Банк"
    } else if (account.bankId === "664c5fd9f70414a0896a95ec") {
      bankName = "Худалдаа Хөгжилийн Банк"
    } else if (account.bankId === "664c5fe9f70414a0896a95ef") {
      bankName = "Хас Банк"
    }
    option.textContent = `${bankName} - Дансны дугаар: "${account.bankAccountNumber}" Үлдэгдэл: ${account.balance}`;
    fromAccountSelect.appendChild(option);
  })
  form.appendChild(fromAccountLabel);
  form.appendChild(fromAccountSelect);

  const toBankLabel = document.createElement("label");
  toBankLabel.textContent = "Ямар банкны данс руу мөнгө шилжүүлэх вэ:";
  const toBankSelect = document.createElement("select");
  toBankSelect.required = true;
  const banks = [
      { id: "664c5faef70414a0896a95e6", name: "Хаан Банк" },
      { id: "664c5fc4f70414a0896a95e9", name: "Голомт Банк" },
      { id: "664c5fd9f70414a0896a95ec", name: "Худалдаа Хөгжилийн Банк" },
      { id: "664c5fe9f70414a0896a95ef", name: "Хас Банк" }
  ];
  banks.forEach(bank => {
      const option = document.createElement("option");
      option.value = bank.id;
      option.textContent = bank.name;
      toBankSelect.appendChild(option);
  });
  form.appendChild(toBankLabel);
  form.appendChild(toBankSelect);

  const toAccountLabel = document.createElement("label");
  toAccountLabel.textContent = "Хүлээн авагчийн дансны дугаар:";
  const toAccountInput = document.createElement("input");
  toAccountInput.required = true;
  toAccountInput.type = "text";

  const foundReceiverName = document.createElement("p");
  let receiverLocked = false
  form.appendChild(toAccountLabel);
  form.appendChild(toAccountInput);
  form.appendChild(foundReceiverName)

  // Event listener to validate recipient account
  toAccountInput.addEventListener("input", async () => {
      const accountNumber = toAccountInput.value;
      const bankId = toBankSelect.value;
      // Add logic to validate account number with the bank ID
      // Fetch account validation from the server if needed
      const response = await fetch(apiURL + "/findUser", {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // Include token if needed for authentication
        },
        body: JSON.stringify({
            accountNumber,
            bankId // Replace with actual bankId
        })

      })

      if (response.status === 403) {
        renderLogin();
        return;
      } else {
        if (response.status !== 404) {
          const data = await response.json();
          console.log(data)
          foundReceiverName.textContent = `Хүлээн авагчийн нэр: ${data.userName}`;
          receiverLocked = true
        } else {
          foundReceiverName.textContent = "Ийм данстай хэрэглэгч алга."
          receiverLocked = false;
        }
      }
  });

  const amountLabel = document.createElement("label");
  amountLabel.textContent = "Гүйлгээний хэмжээ:";
  const amountInput = document.createElement("input");
  amountInput.required = true
  amountInput.type = "number";
  amountInput.min = 1;
  form.appendChild(amountLabel);
  form.appendChild(amountInput);

  // Select for currency type
  const currencyLabel = document.createElement("label");
  currencyLabel.textContent = "Мөнгөн тэмдэгт:";
  const currencySelect = document.createElement("select");
  currencySelect.required = true;
  ["MNT", "USD"].forEach(currency => {
      const option = document.createElement("option");
      option.value = currency;
      option.textContent = currency;
      currencySelect.appendChild(option);
  });
  form.appendChild(currencyLabel);
  form.appendChild(currencySelect);

  // Input for description
  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "Гүйлгээний утга:";
  const descriptionInput = document.createElement("textarea");
  descriptionInput.required = true
  form.appendChild(descriptionLabel);
  form.appendChild(descriptionInput);

  // Submit button
  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Гүйлгээ хийх";
  form.appendChild(submitButton);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fromAccount = fromAccountSelect.value;
    const toBank = toBankSelect.value;
    const toAccount = toAccountInput.value;
    const amount = amountInput.value;
    const currency = currencySelect.value;
    const description = descriptionInput.value;

    const selectedAccount = myAccounts.find(account => account.bankAccountNumber === fromAccount);
    if (selectedAccount.balance < amount) {
        alert("Үлдэгдэл хүрэлцэхгүй байна.");
        return;
    }

    const transaction = {
        senderId: fromAccount,
        receiverId: toAccount,
        amount: parseFloat(amount),
        moneyType: currency,
        transactionValue: description,
        date: new Date()
    };

    const response = await fetch(apiURL + "/transaction", {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(transaction)
    });

    if (response.ok) {
        alert("Гүйлгээ амжилттай хийгдлээ.");
        await renderTransactions(div);
    } else {
        alert("Гүйлгээ амжилтгүй боллоо. Таны дансны үлдэгдэл хүрэхгүй байна.");
        await renderTransactions(div);
    }
  });


  div.appendChild(form)
}


const logout = () => {
  localStorage.setItem("accessToken", "");
  accessToken = ""
}

fetchInfo();

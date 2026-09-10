// 1. Page Load hone par Date aur Payee list set karna
window.onload = function() {
    const list = document.getElementById('payee-options');
    if (list && typeof MIS_MASTER_DATA !== 'undefined') {
        list.innerHTML = "";
        MIS_MASTER_DATA.forEach(person => {
            let option = document.createElement('option');
            option.value = person.name;
            list.appendChild(option);
        });
    }

    const d = new Date();
    document.getElementById('v-day').value = String(d.getDate()).padStart(2, '0');
    document.getElementById('v-month').value = String(d.getMonth() + 1).padStart(2, '0');
    document.getElementById('v-year').value = d.getFullYear();
    if(document.getElementById('v-prep-date')) {
        document.getElementById('v-prep-date').value = d.toLocaleDateString();
    }
};

// 2. Payee select karne par auto-fill karna
function checkAutoFill(val) {
    const person = MIS_MASTER_DATA.find(p => p.name.trim() === val.trim());
    if (person) {
        document.getElementById('v-payee-acc').value = person.account;
        document.getElementById('v-payee-ifsc').value = person.ifsc;
        document.getElementById('v-payee-bank').value = person.bank;
        
        const mainAmtInput = document.getElementById('main-amt');
        mainAmtInput.value = (parseFloat(person.amount) > 0) ? person.amount : "";
        calculateAll();
    }
}

// 3. Calculation logic
const calcInputs = document.querySelectorAll('.calc-in');
calcInputs.forEach(input => {
    input.addEventListener('input', calculateAll);
});

function calculateAll() {
    const inputs = document.querySelectorAll('.calc-in');
    let p = parseFloat(inputs[0].value) || 0;
    let c = parseFloat(inputs[1].value) || 0;
    let g = parseFloat(inputs[2].value) || 0;
    let t = parseFloat(inputs[3].value) || 0;
    let o = parseFloat(inputs[4].value) || 0;
    let a = parseFloat(inputs[5].value) || 0;

    let total = (p + c + g + o) - (t + a);
    
    document.getElementById('v-calc-total').value = total.toFixed(2);
    document.getElementById('v-amt-num').value = total.toFixed(2);
    document.getElementById('v-amt-words').value = numberToWords(total);
}

// 4. Amount to Words function
function numberToWords(num) {
    if (num === 0) return "Zero Only";
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    function makeWords(n) {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
        if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + (n % 100 !== 0 ? "and " + makeWords(n % 100) : "");
        return "";
    }
    
    let n = Math.floor(num);
    let str = "";
    let lakh = Math.floor(n / 100000); n %= 100000;
    let thousand = Math.floor(n / 1000); n %= 1000;
    
    if (lakh > 0) str += makeWords(lakh) + "Lakh ";
    if (thousand > 0) str += makeWords(thousand) + "Thousand ";
    if (n > 0) str += makeWords(n);
    return str + "Rupees Only";
}

// 5. Google Sheets Integration
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbwEd4_2pzFaFuCVv1X3N1NY1hEgWNuNQ_TAa7SY08-kteV7v2PXxSvsKgXEdGvWDLeQ-A/exec";

async function saveToGoogleSheets() {
    const voucherData = {
        date: document.getElementById('v-day').value + "/" + document.getElementById('v-month').value + "/" + document.getElementById('v-year').value,
        vNo: document.getElementById('v-no').value,
        payee: document.getElementById('v-payee-name').value,
        purpose: document.getElementById('v-purpose').value,
        amount: document.getElementById('v-amt-num').value
    };

    if (!voucherData.payee || voucherData.payee === "") return;

    try {
        await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voucherData)
        });
        console.log("Data saved to sheet");
    } catch (error) {
        console.error("Error:", error);
    }
}

// 6. Final Print Handler
function handlePrint() {
    saveToGoogleSheets(); // Sheet mein save karega
    setTimeout(() => {
        window.print();   // 0.5 second baad print kholega taaki data chala jaye
    }, 500);
}
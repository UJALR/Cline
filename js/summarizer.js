async function summarizePortfolio() {
    const output = document.getElementById("summary-output");
    output.textContent = "Generating summary...";

    try {
        const response = await fetch("https://cline-1-gotw.onrender.com/summarize-portfolio", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                request: "Summarize the portfolio displayed on this website."
            })
        });

        const data = await response.json();

        if (data.summary) {
            output.textContent = data.summary;
        } else {
            output.textContent = "No summary returned.";
        }
    } catch (error) {
        output.textContent = "Error: " + error.message;
    }
}

async function testWandbox() {
    const result = await fetch('http://localhost:3000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            lang: 71, // python
            code: 'print("Testing Wandbox integration!")\nimport sys\nprint("Error OK", file=sys.stderr)'
        })
    });
    const data = await result.json();
    console.log('Execute output:', data);
}

testWandbox();

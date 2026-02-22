import { NextRequest, NextResponse } from 'next/server';

const WANDBOX_API_URL = 'https://wandbox.org/api/compile.json';

// Mapping Judge0 ID -> Wandbox compiler name
const LANGUAGE_MAP: Record<number, string> = {
    63: 'nodejs-20.17.0',
    71: 'cpython-3.14.0',
    54: 'gcc-13.2.0',
    62: 'openjdk-jdk-22+36',
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { code, lang = 63 } = body;

        if (!code || typeof code !== 'string') {
            return NextResponse.json({ success: false, error: 'Invalid or missing code' }, { status: 400 });
        }

        const compiler = LANGUAGE_MAP[lang];
        if (!compiler) {
            return NextResponse.json({ success: false, error: `Language ID ${lang} not supported by our Wandbox integration` }, { status: 400 });
        }

        const response = await fetch(WANDBOX_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: code,
                compiler: compiler,
                stdin: ''
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ success: false, error: `Wandbox API failed: ${errorText}` }, { status: 500 });
        }

        const data = await response.json();

        const isError = data.status !== "0";

        return NextResponse.json({
            success: !isError,
            stdout: data.program_message || '',
            stderr: data.program_error || data.compiler_error || '',
            time: 0,
            memory: 0,
            status: isError ? (data.compiler_error ? 'Compilation Error' : 'Runtime Error') : 'Accepted'
        });

    } catch (error: any) {
        console.error('Execute API Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * This module wraps user-submitted code in the necessary boilerplate to 
 * read standard input, execute the function, and print standard output.
 * 
 * STRATEGY:
 * - For known problem slugs, use problem-specific wrappers.
 * - For unknown problems, use a SMART generic wrapper that:
 *   1. Detects the user's function name from the code
 *   2. Reads stdin as lines
 *   3. Parses each input line as JSON (arrays, numbers, strings)
 *   4. Calls the user function with parsed args
 *   5. Prints the result as JSON
 */

export function wrapCode(slug: string, language: string, userCode: string): string {
    const wrapperMap: Record<string, any> = {
        'merge-two-sorted-lists': {
            python: pythonMergeTwoLists(userCode),
            javascript: jsMergeTwoLists(userCode),
        },
        'reverse-linked-list': {
            python: pythonReverseLinkedList(userCode),
            javascript: jsReverseLinkedList(userCode),
        },
    };

    if (wrapperMap[slug]?.[language]) {
        return wrapperMap[slug][language];
    }

    return generateGenericWrapper(language, userCode);
}

// ==== GENERIC SMART WRAPPER ====

function generateGenericWrapper(language: string, userCode: string): string {
    if (language === 'python') return pythonGenericWrapper(userCode);
    if (language === 'javascript') return jsGenericWrapper(userCode);
    if (language === 'cpp') return cppGenericWrapper(userCode);
    if (language === 'java') return javaGenericWrapper(userCode);
    return userCode;
}

function pythonGenericWrapper(userCode: string): string {
    return `
import sys
import json
import re

${userCode}

def _parse_val(s):
    s = s.strip()
    if not s:
        return s
    try:
        return json.loads(s)
    except:
        return s

def _format_output(val):
    if val is None:
        return "null"
    if isinstance(val, bool):
        return "true" if val else "false"
    if isinstance(val, list):
        return json.dumps(val, separators=(',', ': '))
    if isinstance(val, str):
        return val
    return str(val)

if __name__ == '__main__':
    # Find the user's main function name
    code_text = """${userCode.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"')}"""
    fn_match = re.findall(r'^def\\s+(\\w+)\\s*\\(', code_text, re.MULTILINE)
    # Filter out helper/private functions
    fn_names = [f for f in fn_match if not f.startswith('_')]
    
    if not fn_names:
        # No function found - just execute the code as-is (for SQL etc.)
        pass
    else:
        func_name = fn_names[0]
        func = globals().get(func_name)
        if func:
            lines = sys.stdin.read().strip().splitlines()
            args = [_parse_val(line) for line in lines]
            try:
                result = func(*args)
                print(_format_output(result))
            except TypeError:
                # If too many args, try with fewer
                try:
                    result = func(args[0]) if len(args) == 1 else func(args[0], args[1])
                    print(_format_output(result))
                except Exception as e:
                    print(str(e))
`;
}

function jsGenericWrapper(userCode: string): string {
    return `
${userCode}

const fs = require('fs');

function _parseVal(s) {
    s = s.trim();
    if (!s) return s;
    try { return JSON.parse(s); } catch { return s; }
}

function _formatOutput(val) {
    if (val === null || val === undefined) return "null";
    if (typeof val === 'boolean') return val ? "true" : "false";
    if (Array.isArray(val)) return JSON.stringify(val);
    return String(val);
}

// Detect function name
const codeText = ${JSON.stringify(userCode)};
const fnMatch = codeText.match(/function\\s+(\\w+)\\s*\\(/g) || [];
const fnNames = fnMatch.map(m => m.replace(/function\\s+/, '').replace(/\\s*\\(/, '')).filter(n => !n.startsWith('_'));

if (fnNames.length > 0) {
    const funcName = fnNames[0];
    const func = eval(funcName);
    
    try {
        const input = fs.readFileSync('/dev/stdin', 'utf-8').trim();
        const lines = input.split('\\n');
        const args = lines.map(_parseVal);
        
        let result;
        try {
            result = func(...args);
        } catch {
            result = args.length === 1 ? func(args[0]) : func(args[0], args[1]);
        }
        console.log(_formatOutput(result));
    } catch (e) {
        console.log(e.message);
    }
}
`;
}

function cppGenericWrapper(userCode: string): string {
    // For C++, just return the raw code - user needs to handle I/O
    return userCode;
}

function javaGenericWrapper(userCode: string): string {
    // For Java, just return the raw code - user needs to handle I/O
    return userCode;
}

// ==== LINKED LIST WRAPPERS ====

function pythonMergeTwoLists(userCode: string) {
    return `
import sys
import json

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

${userCode}

def build_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    curr = head
    for val in arr[1:]:
        curr.next = ListNode(val)
        curr = curr.next
    return head

def list_to_arr(node):
    res = []
    while node:
        res.append(node.val)
        node = node.next
    return res

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if len(lines) >= 2:
        l1 = build_list(json.loads(lines[0]))
        l2 = build_list(json.loads(lines[1]))
        res = mergeTwoLists(l1, l2)
        print(json.dumps(list_to_arr(res)))
`;
}

function jsMergeTwoLists(userCode: string) {
    return `
class ListNode {
    constructor(val = 0, next = null) { this.val = val; this.next = next; }
}

${userCode}

function buildList(arr) {
    if (!arr || !arr.length) return null;
    let head = new ListNode(arr[0]);
    let curr = head;
    for (let i = 1; i < arr.length; i++) { curr.next = new ListNode(arr[i]); curr = curr.next; }
    return head;
}

function listToArr(node) {
    let res = [];
    while (node) { res.push(node.val); node = node.next; }
    return res;
}

const fs = require('fs');
const lines = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
if (lines.length >= 2) {
    const l1 = buildList(JSON.parse(lines[0]));
    const l2 = buildList(JSON.parse(lines[1]));
    const res = mergeTwoLists(l1, l2);
    console.log(JSON.stringify(listToArr(res)));
}
`;
}

function pythonReverseLinkedList(userCode: string) {
    return `
import sys
import json

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

${userCode}

def build_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    curr = head
    for val in arr[1:]:
        curr.next = ListNode(val)
        curr = curr.next
    return head

def list_to_arr(node):
    res = []
    while node:
        res.append(node.val)
        node = node.next
    return res

if __name__ == '__main__':
    lines = sys.stdin.read().splitlines()
    if lines:
        arr = json.loads(lines[0])
        head = build_list(arr)
        res = reverseList(head)
        print(json.dumps(list_to_arr(res)))
`;
}

function jsReverseLinkedList(userCode: string) {
    return `
class ListNode {
    constructor(val = 0, next = null) { this.val = val; this.next = next; }
}

${userCode}

function buildList(arr) {
    if (!arr || !arr.length) return null;
    let head = new ListNode(arr[0]);
    let curr = head;
    for (let i = 1; i < arr.length; i++) { curr.next = new ListNode(arr[i]); curr = curr.next; }
    return head;
}

function listToArr(node) {
    let res = [];
    while (node) { res.push(node.val); node = node.next; }
    return res;
}

const fs = require('fs');
const lines = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
if (lines.length > 0) {
    const arr = JSON.parse(lines[0]);
    const head = buildList(arr);
    const res = reverseList(head);
    console.log(JSON.stringify(listToArr(res)));
}
`;
}

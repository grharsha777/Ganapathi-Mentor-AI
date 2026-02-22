/**
 * This module wraps user-submitted code in the necessary boilerplate to 
 * read standard input, execute the function, and print standard output.
 */

export function wrapCode(slug: string, language: string, userCode: string): string {
    const wrapperMap: Record<string, any> = {
        'merge-two-sorted-lists': {
            python: pythonMergeTwoLists(userCode),
            javascript: jsMergeTwoLists(userCode),
            cpp: cppMergeTwoLists(userCode),
            java: javaMergeTwoLists(userCode),
        }
    };

    // If we have a custom wrapper for this specific problem, use it.
    if (wrapperMap[slug] && wrapperMap[slug][language]) {
        return wrapperMap[slug][language];
    }

    // Otherwise, attempt a generic wrapper or just return raw code
    return generateGenericWrapper(language, userCode);
}

// ==== MERGE TWO SORTED LISTS ====

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

def print_list(node):
    res = []
    while node:
        res.append(node.val)
        node = node.next
    print("[" + ",".join(map(str, res)) + "]")

if __name__ == '__main__':
    try:
        lines = sys.stdin.read().splitlines()
        if len(lines) >= 2:
            l1 = build_list(json.loads(lines[0]))
            l2 = build_list(json.loads(lines[1]))
            res = mergeTwoLists(l1, l2)
            print_list(res)
    except Exception as e:
        print(str(e))
`;
}

function jsMergeTwoLists(userCode: string) {
    return `
class ListNode {
    constructor(val = 0, next = null) {
        this.val = val;
        this.next = next;
    }
}

${userCode}

function buildList(arr) {
    if (!arr || arr.length === 0) return null;
    let head = new ListNode(arr[0]);
    let curr = head;
    for (let i = 1; i < arr.length; i++) {
        curr.next = new ListNode(arr[i]);
        curr = curr.next;
    }
    return head;
}

function printList(node) {
    let res = [];
    while (node) {
        res.push(node.val);
        node = node.next;
    }
    console.log("[" + res.join(",") + "]");
}

const fs = require('fs');
try {
    const input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\n');
    if (input.length >= 2) {
        const l1 = buildList(JSON.parse(input[0]));
        const l2 = buildList(JSON.parse(input[1]));
        const res = mergeTwoLists(l1, l2);
        printList(res);
    }
} catch (e) {
    console.log(e.message);
}
`;
}

function cppMergeTwoLists(userCode: string) {
    return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>

using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

// Remove the standalone function declaration if user included it, 
// but we just assume the user code provides ListNode* mergeTwoLists(ListNode* l1, ListNode* l2)
${userCode}

ListNode* buildList(const vector<int>& v) {
    if (v.empty()) return nullptr;
    ListNode* head = new ListNode(v[0]);
    ListNode* curr = head;
    for (size_t i = 1; i < v.size(); ++i) {
        curr->next = new ListNode(v[i]);
        curr = curr->next;
    }
    return head;
}

void printList(ListNode* node) {
    cout << "[";
    bool first = true;
    while (node) {
        if (!first) cout << ",";
        cout << node->val;
        first = false;
        node = node->next;
    }
    cout << "]" << endl;
}

vector<int> parseArray(string s) {
    vector<int> res;
    if (s.empty() || s == "[]") return res;
    s = s.substr(1, s.length() - 2); // remove [ and ]
    stringstream ss(s);
    string item;
    while (getline(ss, item, ',')) {
        res.push_back(stoi(item));
    }
    return res;
}

int main() {
    string line1, line2;
    if (getline(cin, line1) && getline(cin, line2)) {
        ListNode* l1 = buildList(parseArray(line1));
        ListNode* l2 = buildList(parseArray(line2));
        ListNode* res = mergeTwoLists(l1, l2);
        printList(res);
    }
    return 0;
}
`;
}

function javaMergeTwoLists(userCode: string) {
    return `
import java.util.*;
import java.io.*;

class ListNode {
    int val;
    ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

public class Main {
    
${userCode.replace(/public\\s+ListNode\\s+mergeTwoLists/, 'public static ListNode mergeTwoLists')}

    public static ListNode buildList(int[] arr) {
        if (arr == null || arr.length == 0) return null;
        ListNode head = new ListNode(arr[0]);
        ListNode curr = head;
        for (int i = 1; i < arr.length; i++) {
            curr.next = new ListNode(arr[i]);
            curr = curr.next;
        }
        return head;
    }

    public static void printList(ListNode node) {
        List<Integer> res = new ArrayList<>();
        while (node != null) {
            res.add(node.val);
            node = node.next;
        }
        System.out.print("[");
        for (int i = 0; i < res.size(); i++) {
            System.out.print(res.get(i));
            if (i < res.size() - 1) System.out.print(",");
        }
        System.out.println("]");
    }

    public static int[] parseArray(String s) {
        if (s == null || s.trim().equals("[]") || s.trim().isEmpty()) return new int[0];
        s = s.substring(1, s.length() - 1);
        String[] parts = s.split(",");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i].trim());
        }
        return arr;
    }

    public static void main(String[] args) {
        try (Scanner scanner = new Scanner(System.in)) {
            if (scanner.hasNextLine()) {
                String line1 = scanner.nextLine();
                String line2 = scanner.nextLine();
                ListNode l1 = buildList(parseArray(line1));
                ListNode l2 = buildList(parseArray(line2));
                ListNode res = mergeTwoLists(l1, l2);
                printList(res);
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }
}
`;
}

// ==== GENERIC WRAPPER (Fallback for simple string processing) ====

function generateGenericWrapper(language: string, userCode: string) {
    // If it's just raw functions, it won't execute without a print block.
    // This generic wrapper attempts to guess the function and invoke it with line inputs,
    // assuming inputs are simple strings or comma separated numbers.
    // For now, we will just return userCode if we don't have a reliable generic wrapper.
    return userCode;
}

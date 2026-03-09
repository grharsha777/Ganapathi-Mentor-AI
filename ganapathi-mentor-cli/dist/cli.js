"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const figlet_1 = __importDefault(require("figlet"));
const gradient_string_1 = __importDefault(require("gradient-string"));
const mistral_1 = require("./ai/mistral");
const program = new commander_1.Command();
program
    .name('ganapathi mentor')
    .description('Ganapathi Mentor AI – Terminal Edition')
    .version('1.0.0');
// Display the amazing retro gradient logo
function displayLogo() {
    const logoText = figlet_1.default.textSync('Ganapathi\nMentor AI', { horizontalLayout: 'full' });
    console.log(gradient_string_1.default.pastel.multiline(logoText));
    console.log(gradient_string_1.default.pastel('       The highly advanced senior engineer living in your terminal.\n'));
}
program
    .command('mentor')
    .description('Explain code, architecture, and answer design questions.')
    .argument('<prompt>', 'Your question or request')
    .action((prompt) => {
    displayLogo();
    (0, mistral_1.runMistral)('mentor', prompt);
});
program
    .command('fix')
    .description('Locate root cause and propose minimal fixes for errors/bugs.')
    .argument('<prompt>', 'Error description or logs')
    .action((prompt) => {
    displayLogo();
    (0, mistral_1.runMistral)('fix', prompt);
});
program
    .command('plan')
    .description('Turn feature ideas into concrete task plans and execution.')
    .argument('<prompt>', 'The feature to build')
    .action((prompt) => {
    displayLogo();
    (0, mistral_1.runMistral)('plan', prompt);
});
program
    .command('ops')
    .description('Help with infra, scripts, CI, Docker configs.')
    .argument('<prompt>', 'The infra operation')
    .action((prompt) => {
    displayLogo();
    (0, mistral_1.runMistral)('ops', prompt);
});
// Wildcard for unrecognised mode that we just pass on
program
    .argument('[prompt...]', 'Natural language prompt')
    .action((promptArray) => {
    if (promptArray && promptArray.length > 0) {
        displayLogo();
        (0, mistral_1.runMistral)('general', promptArray.join(' '));
    }
    else {
        program.help();
    }
});
program.parse(process.argv);

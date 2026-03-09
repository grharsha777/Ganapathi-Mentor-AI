import { Command } from 'commander';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { runMistral } from './ai/mistral';

const program = new Command();

program
    .name('ganapathi mentor')
    .description('Ganapathi Mentor AI – Terminal Edition')
    .version('1.0.0');

// Display the amazing retro gradient logo
function displayLogo() {
    const logoText = figlet.textSync('Ganapathi\nMentor AI', { horizontalLayout: 'full' });
    console.log(gradient.pastel.multiline(logoText));
    console.log(gradient.pastel('       The highly advanced senior engineer living in your terminal.\n'));
}

program
    .command('mentor')
    .description('Explain code, architecture, and answer design questions.')
    .argument('<prompt>', 'Your question or request')
    .action((prompt) => {
        displayLogo();
        runMistral('mentor', prompt);
    });

program
    .command('fix')
    .description('Locate root cause and propose minimal fixes for errors/bugs.')
    .argument('<prompt>', 'Error description or logs')
    .action((prompt) => {
        displayLogo();
        runMistral('fix', prompt);
    });

program
    .command('plan')
    .description('Turn feature ideas into concrete task plans and execution.')
    .argument('<prompt>', 'The feature to build')
    .action((prompt) => {
        displayLogo();
        runMistral('plan', prompt);
    });

program
    .command('ops')
    .description('Help with infra, scripts, CI, Docker configs.')
    .argument('<prompt>', 'The infra operation')
    .action((prompt) => {
        displayLogo();
        runMistral('ops', prompt);
    });

// Wildcard for unrecognised mode that we just pass on
program
    .argument('[prompt...]', 'Natural language prompt')
    .action((promptArray) => {
        if (promptArray && promptArray.length > 0) {
            displayLogo();
            runMistral('general', promptArray.join(' '));
        } else {
            program.help();
        }
    });

program.parse(process.argv);

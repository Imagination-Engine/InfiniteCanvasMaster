import { Command } from 'commander';

const program = new Command();

program
  .name('iem')
  .description('Imagination Engine CLI tool suite')
  .version('1.0.0');

program
  .command('test-cmd')
  .description('A test command')
  .option('--param <param>', 'A test parameter')
  .action((options) => {
    console.log(`Executed test-cmd with param: ${options.param}`);
  });

program
  .command('new-mcp')
  .description('Scaffold a new MCP server')
  .action(() => {
    console.log('Scaffolding new MCP server...');
  });

program
  .command('pr-prep')
  .description('Prepare a PR')
  .action(() => {
    console.log('Preparing PR...');
  });

program.parse(process.argv);
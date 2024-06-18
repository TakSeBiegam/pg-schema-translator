export function displayVersion() {
  const versionString = `
      v: 0.0.1`;
  console.log(versionString);
}

export function displayHelp() {
  const helpString = `
    ----------------------------------
    Usage: index.js
  
    Commands:
      convert <input file> <output file>        Convert current graphql schema provided on input, and generate output file with pg-schema
      mock <mock name>                          Use one of mock graphql schemas to test converter
      help                                      Show help
      version                                   Show version
    `;
  console.log(helpString);
}

export default function translateLines(lines: any, repositoryPath: any, fileName: any, commitSha: any): Promise<Map<any, any>>;
export declare function getDiff(respositoryPath: any, fileName: any, commitSha: any): Promise<string>;
export declare function translateLinesGivenDiff(lines: number[], rawDiff: any): Map<any, any>;
export declare function diffPositionToFilePosition(positions: number[], diffInput: any): Map<any, any>;

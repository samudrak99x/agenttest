import { AgentBuilder } from "../services/agentBuilder";
import { SystemMessage } from "@langchain/core/messages";
import { Utility } from "../utils/utility";
import { FileHandler } from "../utils/fileHandler";
import { Logger } from "../utils/logger";

// Initialize the agent builder and build the agent once during startup
const agentBuilder = new AgentBuilder();
const agent = agentBuilder.buildAgent();

/**
 * Controller function to handle agent operations on code files.
 * @param message - The message to be sent to the agent.
 * @param repoPath - The repository path where files are located.
 * @param filePaths - Array of file paths to be processed.
 * @returns An object containing the status of each file processed.
 */
export const agentController = async (message: string, repoPath: string, filePaths: string[]) => {
    const fileProcessingResults: { filePath: string; message: string }[] = [];

    for (const filePath of filePaths) {
        try {
            const codeContent = FileHandler.readCodeFile(repoPath, filePath);

            const agentResponse = await agent.agent.invoke({
                messages: [
                    new SystemMessage(message),
                    new SystemMessage(`Code: ${codeContent}`)
                ]
            });

            const agentMessage = agentResponse.messages[agentResponse.messages.length - 1].content;
            const modifiedCode = Utility.parseAgentCodeResponse(agentMessage);

            await FileHandler.writeCodeFile(repoPath, filePath, modifiedCode);
            fileProcessingResults.push({ filePath, message: "Code written successfully." });
            Logger.info(`File processed successfully: ${filePath}`);

        } catch (error) {
            Logger.error(`Error processing file ${filePath}: ${error.message}`);
            fileProcessingResults.push({ filePath, message: "Error processing file." });
        }
    }

    return { fileProcessingResults };
};
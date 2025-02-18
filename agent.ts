import { AgentBuilder } from "../services/agentBuilder";
import { SystemMessage } from "@langchain/core/messages";
import { Utility } from "../utils/utility";
import { FileHandler } from "../utils/fileHandler";

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
    const changedFiles = []; // Array to store the status of each file processed

    for (const filePath of filePaths) {
        try {
            // Read the content of the code file
            const codeContent = FileHandler.readCodeFile(repoPath, filePath);

            // Invoke the agent with the message and code content
            const agentResponse = await agent.agent.invoke({
                messages: [
                    new SystemMessage(message),
                    new SystemMessage(`Code: ${codeContent}`)
                ]
            });

            // Extract the last message from the agent's response
            const agentMessage = agentResponse.messages[agentResponse.messages.length - 1].content;

            // Parse the agent's response to get the modified code
            const parsedCode = Utility.parseAgentCodeResponse(agentMessage);

            // Write the modified code back to the file
            await FileHandler.writeCodeFile(repoPath, filePath, parsedCode);
            changedFiles.push({ filePath, message: "Code written successfully." });

        } catch (error) {
            // Handle errors during file reading or writing
            console.error(`Error processing file ${filePath}:`, error);
            changedFiles.push({ filePath, message: "Error processing file." });
        }
    }

    return { changedFiles };
};
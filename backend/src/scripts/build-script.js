const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const publicPath = path.join(process.cwd(), "public");
const targetPath = path.join(process.cwd(), ".medusa", "server", "public");

console.log("Creating public directory link...");

// Remove existing public directory if it exists
if (fs.existsSync(publicPath)) {
    try {
        if (fs.lstatSync(publicPath).isSymbolicLink()) {
            fs.unlinkSync(publicPath);
            console.log("Removed existing symbolic link");
        } else {
            fs.rmSync(publicPath, { recursive: true, force: true });
            console.log("Removed existing public directory");
        }
    } catch (error) {
        console.log("Error removing existing public directory:", error.message);
    }
}

// Create symbolic link or copy files based on platform
if (process.platform === "win32") {
    try {
        // Try to create symbolic link on Windows
        execSync(`mklink /d public .medusa\\server\\public`, { stdio: "inherit" });
        console.log("Symbolic link created successfully on Windows");
    } catch (error) {
        console.log("Symbolic link failed, copying files instead...");
        // Fallback to copying files
        if (!fs.existsSync(publicPath)) {
            fs.mkdirSync(publicPath, { recursive: true });
        }
        execSync(`xcopy .medusa\\server\\public\\* public\\ /E /I /Y`, {
            stdio: "inherit",
        });
    }
} else {
    // Unix-like systems (Linux, macOS)
    try {
        // Check if target directory exists
        if (!fs.existsSync(targetPath)) {
            console.log("Target directory does not exist:", targetPath);
            console.log("Available directories in .medusa:");
            if (fs.existsSync(path.join(process.cwd(), ".medusa"))) {
                const medusaContents = fs.readdirSync(
                    path.join(process.cwd(), ".medusa")
                );
                console.log(medusaContents);
            }
            throw new Error("Target directory not found");
        }

        // Try to create symbolic link on Unix-like systems
        fs.symlinkSync(targetPath, publicPath, "dir");
        console.log("Symbolic link created successfully on Unix");
    } catch (error) {
        console.log("Symbolic link failed, copying files instead...");
        console.log("Error:", error.message);

        // Fallback to copying files
        if (!fs.existsSync(publicPath)) {
            fs.mkdirSync(publicPath, { recursive: true });
        }

        try {
            // Use rsync if available (more reliable than cp)
            execSync(`rsync -av ${targetPath}/ ${publicPath}/`, {
                stdio: "inherit",
                shell: true,
            });
            console.log("Files copied using rsync");
        } catch (rsyncError) {
            console.log("rsync not available, using cp...");
            try {
                execSync(`cp -r ${targetPath}/* ${publicPath}/`, {
                    stdio: "inherit",
                    shell: true,
                });
                console.log("Files copied using cp");
            } catch (cpError) {
                console.log("cp failed, trying manual copy...");
                // Manual file copy as last resort
                copyDirectoryRecursive(targetPath, publicPath);
            }
        }
    }
}

// Helper function for manual directory copying
function copyDirectoryRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);

    for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);

        const stat = fs.statSync(srcPath);

        if (stat.isDirectory()) {
            copyDirectoryRecursive(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log("Public directory setup completed!");
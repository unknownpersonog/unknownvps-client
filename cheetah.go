package main

import (
	"fmt"
	"log"
	"net/http"
	"os/exec"
    "time"
    "os"
)

const (
	port = ":8080"
)

func main() {
	fmt.Println("Starting server...")
	fmt.Println(asciiArt)
	http.HandleFunc("/create_container", handleCreateContainer)
	log.Fatal(http.ListenAndServe(port, nil))
}

func handleCreateContainer(w http.ResponseWriter, r *http.Request) {
	containerName := r.URL.Query().Get("container_name")
	containerOS := r.URL.Query().Get("container_os")
	containerID := r.URL.Query().Get("container_id")
	portID := r.URL.Query().Get("port_id")

    fmt.Println("Received request for container", containerName, "with", "OS", containerOS, "ID", containerID, "and", "port", "ID", portID)    
	cmd := exec.Command("sudo", "lxc", "init", "images:debian/11", containerName)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		log.Fatalf("Error executing command cmd0: %v", err)
	}

	// Wait for container to start
	time.Sleep(15 * time.Second)

	// Set container limits
	cmd1 := exec.Command("sudo", "lxc", "config", "set", containerName, "limits.cpu.allowance", "10%")
	cmd1.Stdout = os.Stdout
	cmd1.Stderr = os.Stderr
	if err := cmd1.Run(); err != nil {
		log.Fatalf("Error executing command cmd1: %v", err)
	}

	cmd2 := exec.Command("sudo", "lxc", "config", "device", "override", containerName, "root", "size=512MB")
	cmd2.Stdout = os.Stdout
	cmd2.Stderr = os.Stderr
	if err := cmd2.Run(); err != nil {
		log.Fatalf("Error executing command cmd2: %v", err)
	}

	// Start container
	cmd3 := exec.Command("sudo", "lxc", "start", containerName)
	cmd3.Stdout = os.Stdout
	cmd3.Stderr = os.Stderr
	if err := cmd3.Run(); err != nil {
		log.Fatalf("Error executing command cmd3: %v", err)
	}

	// Install curl
	cmd4 := exec.Command("sudo", "lxc", "exec", containerName, "--", "apt", "update")
	cmd4.Stdout = os.Stdout
	cmd4.Stderr = os.Stderr
	if err := cmd4.Run(); err != nil {
		log.Fatalf("Error executing command cmd4: %v", err)
	}

	cmd5 := exec.Command("sudo", "lxc", "exec", containerName, "--", "apt", "install", "curl", "-y")
	cmd5.Stdout = os.Stdout
	cmd5.Stderr = os.Stderr
	if err := cmd5.Run(); err != nil {
		log.Fatalf("Error executing command cmd5: %v", err)
	}

	// Download and run setup script
	cmd6 := exec.Command("sudo", "lxc", "exec", containerName, "--", "curl", "-sLo", "setup.sh", "https://raw.githubusercontent.com/unknownpersonog/unknownvps-client/experimental/script.sh")
	cmd6.Stdout = os.Stdout
	cmd6.Stderr = os.Stderr
	if err := cmd6.Run(); err != nil {
		log.Fatalf("Error executing command cmd6: %v", err)
	}
    time.Sleep(15 * time.Second)
    cmd7 := exec.Command("sudo", "lxc", "exec", containerName, "--", "bash", "setup.sh")
	cmd7.Stdout = os.Stdout
	cmd7.Stderr = os.Stderr
    if err := cmd6.Run(); err != nil {
		log.Fatalf("Error executing command cmd7: %v", err)
	}

	fmt.Fprintf(w, "Created container %s with OS %s, ID %s, and port ID %s", containerName, containerOS, containerID, portID)
}

const asciiArt = `
                 _.-----._
              _.'         '._
            .'     ___      '.
           /    .-'   '-.     \
          |   / .     . \    |
          |  |  /       \  |  |
          |  |  |       |  |  |
           \  \  \     /  /  /
            '-.\  '---'  /.-'
               '._     _.'
                  '---'`

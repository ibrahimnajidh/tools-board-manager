// Sample tool data
const tools = [
    { id: 1, number: "T001", name: "Hammer", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Hammer", status: "available" },
    { id: 2, number: "T002", name: "Screwdriver Set", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Screwdriver+Set", status: "available" },
    { id: 3, number: "T003", name: "Wrench", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Wrench", status: "available" },
    { id: 4, number: "T004", name: "Pliers", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Pliers", status: "available" },
    { id: 5, number: "T005", name: "Drill", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Drill", status: "available" },
    { id: 6, number: "T006", name: "Measuring Tape", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Measuring+Tape", status: "available" },
    { id: 7, number: "T007", name: "Level", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Level", status: "available" },
    { id: 8, number: "T008", name: "Socket Set", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Socket+Set", status: "available" },
    { id: 9, number: "T009", name: "Utility Knife", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Utility+Knife", status: "available" },
    { id: 10, number: "T010", name: "Safety Glasses", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Safety+Glasses", status: "available" },
    { id: 11, number: "T011", name: "Wire Cutters", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Wire+Cutters", status: "available" },
    { id: 12, number: "T012", name: "Voltage Tester", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Voltage+Tester", status: "available" },
    { id: 13, number: "T013", name: "Cable Crimper", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Cable+Crimper", status: "available" },
    { id: 14, number: "T014", name: "Multimeter", image: "https://via.placeholder.com/300x200/FF6600/000000?text=Multimeter", status: "available" }
];

// Currently taken tools
let takenTools = [];

// Selected tools for current transaction
let selectedTools = [];

// Image grid pagination
let currentPage = 1;
const itemsPerPage = 12;

// DOM elements
const toolForm = document.getElementById('toolForm');
const serviceNumberInput = document.getElementById('serviceNumber');
const toolsCheckboxContainer = document.getElementById('toolsCheckboxContainer');
const toolsTable = document.getElementById('toolsTable').getElementsByTagName('tbody')[0];
const allToolsTable = document.getElementById('allToolsTable').getElementsByTagName('tbody')[0];
const imageGrid = document.getElementById('imageGrid');
const gridContainer = document.getElementById('gridContainer');
const pagination = document.getElementById('pagination');
const backButton = document.getElementById('backButton');

// Initialize the application
function init() {
    populateToolCheckboxes();
    renderTakenToolsTable();
    renderAllToolsTable();
    
    // Add event listeners
    toolForm.addEventListener('submit', handleToolFormSubmit);
    backButton.addEventListener('click', hideImageGrid);
    
    // Load from localStorage if available
    const savedTakenTools = localStorage.getItem('takenTools');
    if (savedTakenTools) {
        takenTools = JSON.parse(savedTakenTools);
        renderTakenToolsTable();
        updateToolStatuses();
    }
}

// Populate the tool checkboxes
function populateToolCheckboxes() {
    toolsCheckboxContainer.innerHTML = '';
    
    tools.forEach(tool => {
        if (tool.status === 'available') {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'tool-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `tool-${tool.id}`;
            checkbox.value = tool.number;
            checkbox.dataset.toolName = tool.name;
            
            const label = document.createElement('label');
            label.htmlFor = `tool-${tool.id}`;
            label.textContent = `${tool.number} - ${tool.name}`;
            
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    addToolToSelection(tool.number, tool.name);
                } else {
                    removeToolFromSelection(tool.number);
                }
            });
            
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            toolsCheckboxContainer.appendChild(checkboxDiv);
        }
    });
    
    // Add selected tools display
    const selectedToolsDiv = document.createElement('div');
    selectedToolsDiv.className = 'selected-tools';
    selectedToolsDiv.innerHTML = '<h3>Selected Tools:</h3><div id="selectedToolsList"></div>';
    toolsCheckboxContainer.parentNode.appendChild(selectedToolsDiv);
}

// Add tool to selection
function addToolToSelection(toolNumber, toolName) {
    if (!selectedTools.some(tool => tool.number === toolNumber)) {
        selectedTools.push({ number: toolNumber, name: toolName });
        updateSelectedToolsDisplay();
    }
}

// Remove tool from selection
function removeToolFromSelection(toolNumber) {
    selectedTools = selectedTools.filter(tool => tool.number !== toolNumber);
    updateSelectedToolsDisplay();
}

// Update the selected tools display
function updateSelectedToolsDisplay() {
    const selectedToolsList = document.getElementById('selectedToolsList');
    selectedToolsList.innerHTML = '';
    
    if (selectedTools.length === 0) {
        selectedToolsList.innerHTML = '<p>No tools selected</p>';
        return;
    }
    
    selectedTools.forEach(tool => {
        const toolItem = document.createElement('div');
        toolItem.className = 'selected-tool-item';
        toolItem.innerHTML = `
            <span>${tool.number} - ${tool.name}</span>
            <button type="button" class="remove-tool" data-tool-number="${tool.number}">Remove</button>
        `;
        selectedToolsList.appendChild(toolItem);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-tool').forEach(button => {
        button.addEventListener('click', function() {
            const toolNumber = this.dataset.toolNumber;
            removeToolFromSelection(toolNumber);
            // Also uncheck the checkbox
            const checkbox = document.querySelector(`input[value="${toolNumber}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
    });
}

// Handle form submission
function handleToolFormSubmit(e) {
    e.preventDefault();
    
    const serviceNumber = serviceNumberInput.value;
    
    if (!serviceNumber) {
        alert('Please enter a service number');
        return;
    }
    
    if (selectedTools.length === 0) {
        alert('Please select at least one tool');
        return;
    }
    
    // Record each selected tool as taken
    const now = new Date();
    
    selectedTools.forEach(tool => {
        // Find the tool in the tools array
        const toolObj = tools.find(t => t.number === tool.number);
        if (!toolObj) {
            alert(`Tool ${tool.number} not found`);
            return;
        }
        
        // Check if tool is available
        if (toolObj.status !== 'available') {
            alert(`Tool ${tool.number} is currently taken`);
            return;
        }
        
        // Record the tool as taken
        const takenTool = {
            serviceNumber,
            toolNumber: tool.number,
            toolName: tool.name,
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            timestamp: now.getTime()
        };
        
        takenTools.push(takenTool);
        toolObj.status = 'taken';
    });
    
    // Save to localStorage
    localStorage.setItem('takenTools', JSON.stringify(takenTools));
    
    // Update UI
    renderTakenToolsTable();
    renderAllToolsTable();
    populateToolCheckboxes();
    
    // Reset form and selection
    toolForm.reset();
    selectedTools = [];
    updateSelectedToolsDisplay();
}

// Return a tool
function returnTool(index) {
    const takenTool = takenTools[index];
    const tool = tools.find(t => t.number === takenTool.toolNumber);
    
    if (tool) {
        tool.status = 'available';
    }
    
    takenTools.splice(index, 1);
    
    // Save to localStorage
    localStorage.setItem('takenTools', JSON.stringify(takenTools));
    
    // Update UI
    renderTakenToolsTable();
    renderAllToolsTable();
    populateToolCheckboxes();
}

// Render the taken tools table
function renderTakenToolsTable() {
    toolsTable.innerHTML = '';
    
    if (takenTools.length === 0) {
        const row = toolsTable.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6;
        cell.textContent = 'No tools currently taken';
        cell.style.textAlign = 'center';
        return;
    }
    
    // Sort by service number
    takenTools.sort((a, b) => a.serviceNumber.localeCompare(b.serviceNumber));
    
    takenTools.forEach((tool, index) => {
        const row = toolsTable.insertRow();
        
        const serviceCell = row.insertCell();
        serviceCell.textContent = tool.serviceNumber;
        
        const toolCell = row.insertCell();
        toolCell.textContent = tool.toolNumber;
        
        const nameCell = row.insertCell();
        nameCell.textContent = tool.toolName;
        
        const dateCell = row.insertCell();
        dateCell.textContent = tool.date;
        
        const timeCell = row.insertCell();
        timeCell.textContent = tool.time;
        
        const actionCell = row.insertCell();
        const returnButton = document.createElement('button');
        returnButton.textContent = 'Return Tool';
        returnButton.addEventListener('click', () => returnTool(index));
        actionCell.appendChild(returnButton);
    });
}

// Render the all tools table
function renderAllToolsTable() {
    allToolsTable.innerHTML = '';
    
    tools.forEach(tool => {
        const row = allToolsTable.insertRow();
        
        const numberCell = row.insertCell();
        numberCell.innerHTML = `<span class="tool-number" data-tool-number="${tool.number}">${tool.number}</span>`;
        
        const nameCell = row.insertCell();
        nameCell.textContent = tool.name;
        
        const statusCell = row.insertCell();
        statusCell.innerHTML = tool.status === 'available' 
            ? '<span class="status-available">Available</span>' 
            : '<span class="status-taken">Taken</span>';
    });
    
    // Add event listeners to tool numbers
    document.querySelectorAll('.tool-number').forEach(element => {
        element.addEventListener('click', () => {
            showImageGrid();
        });
    });
}

// Update tool statuses based on taken tools
function updateToolStatuses() {
    tools.forEach(tool => {
        const isTaken = takenTools.some(takenTool => takenTool.toolNumber === tool.number);
        tool.status = isTaken ? 'taken' : 'available';
    });
}

// Show the image grid
function showImageGrid() {
    currentPage = 1;
    renderImageGrid();
    imageGrid.style.display = 'block';
}

// Hide the image grid
function hideImageGrid() {
    imageGrid.style.display = 'none';
}

// Render the image grid with pagination
function renderImageGrid() {
    gridContainer.innerHTML = '';
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(tools.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, tools.length);
    
    // Create grid items
    for (let i = startIndex; i < endIndex; i++) {
        const tool = tools[i];
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        
        gridItem.innerHTML = `
            <img src="${tool.image}" alt="${tool.name}">
            <div class="tool-info">
                <h3>${tool.number} - ${tool.name}</h3>
                <p>Status: ${tool.status === 'available' 
                    ? '<span class="status-available">Available</span>' 
                    : '<span class="status-taken">Taken</span>'}</p>
            </div>
        `;
        
        gridContainer.appendChild(gridItem);
    }
    
    // Create pagination buttons
    if (totalPages > 1) {
        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', () => {
                currentPage--;
                renderImageGrid();
            });
            pagination.appendChild(prevButton);
        }
        
        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        pageInfo.style.margin = '0 10px';
        pageInfo.style.color = 'white';
        pagination.appendChild(pageInfo);
        
        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => {
                currentPage++;
                renderImageGrid();
            });
            pagination.appendChild(nextButton);
        }
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', init);
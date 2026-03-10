document.addEventListener('DOMContentLoaded', () => {
    // Navigation Logic
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.view-section');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if (!targetId) return;
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            // Update active section
            sections.forEach(sec => sec.classList.remove('active-section'));
            document.getElementById(targetId).classList.add('active-section');
        });
    });
    // File Upload Simulation
    const resumeFilesInput = document.getElementById('resume-files');
    const resumeList = document.getElementById('resume-list');
    let uploadedResumes = [];
    // Sample mock resumes generated based on count
    const names = ["Alice Smith", "Michael Johnson", "Sarah Williams", "David Brown", "Emma Jones", "James Garcia", "Sophia Martinez", "William Rodriguez"];
    const potentialSkills = ["React", "Node.js", "Python", "AWS", "TypeScript", "SQL", "Docker", "GraphQL", "Figma", "Redux"];
    resumeFilesInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    // Drag and Drop
    const dropArea = document.getElementById('resume-drop');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.add('dragover'), false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => dropArea.classList.remove('dragover'), false);
    });
    dropArea.addEventListener('drop', (e) => {
        handleFiles(e.dataTransfer.files);
    });
    function handleFiles(files) {
        Array.from(files).forEach(file => {
            uploadedResumes.push({
                name: file.name,
                candidate: names[Math.floor(Math.random() * names.length)],
                size: (file.size / 1024).toFixed(1) + ' KB'
            });
        });
        renderFileList();
    }
    // Function to render the list of uploaded files
    function renderFileList() {
        resumeList.innerHTML = '';
        uploadedResumes.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-item-info">
                    <i class="fa-regular fa-file-pdf"></i>
                    <span>${file.name}</span>
                </div>
                <i class="fa-solid fa-xmark remove-file" data-index="${index}"></i>
            `;
            resumeList.appendChild(fileItem);
        });
        // Add remove handlers
        document.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-index');
                uploadedResumes.splice(idx, 1);
                renderFileList();
            });
        });
    }
    // Analysis Logic
    const analyzeBtn = document.getElementById('analyze-btn');
    const overlay = document.getElementById('scanning-overlay');
    const progressBar = document.getElementById('scan-progress');
    const statusText = document.getElementById('scanning-status');
    const statTotal = document.getElementById('stat-total');
    const statShortlisted = document.getElementById('stat-shortlisted');
    const leaderboardBody = document.getElementById('leaderboard-body');
    analyzeBtn.addEventListener('click', () => {
        if (uploadedResumes.length === 0) {
            alert('Please upload at least one resume to score.');
            return;
        }
        overlay.classList.add('active');
        let progress = 0;
        const scanInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            progressBar.style.width = `${progress}%`;
            if (progress > 30 && progress < 60) {
                statusText.innerText = 'Analyzing contextual sentiment & semantics...';
            } else if (progress >= 60 && progress < 90) {
                statusText.innerText = 'Mapping candidate profiles to Job Description...';
            } else if (progress >= 90) {
                statusText.innerText = 'Finalizing scores and ranks...';
            }
            if (progress === 100) {
                clearInterval(scanInterval);
                setTimeout(() => {
                    overlay.classList.remove('active');
                    generateResults();
                    // Switch to dashboard
                    document.querySelector('[data-target="dashboard-section"]').click();
                    // Reset upload state for next time
                    progressBar.style.width = '0%';
                    statusText.innerText = 'Extracting keywords and calculating match rates...';
                }, 800);
            }
        }, 300);
    });
    function generateResults() {
        leaderboardBody.innerHTML = '';
        let results = uploadedResumes.map(resume => {
            const score = Math.floor(Math.random() * 50) + 45; // 45 to 95
            // Generate 3-4 random skills
            const skills = [];
            const skillCount = Math.floor(Math.random() * 2) + 3;
            for (let i = 0; i < skillCount; i++) {
                const s = potentialSkills[Math.floor(Math.random() * potentialSkills.length)];
                if (!skills.includes(s)) skills.push(s);
            }
            return {
                name: resume.candidate,
                score: score,
                skills: skills
            };
        });
        // Sort by score desc
        results.sort((a, b) => b.score - a.score);
        let shortlistCount = 0;
        results.forEach((res, index) => {
            if (res.score >= 70) shortlistCount++;
            let badgeClass = 'score-low';
            if (res.score >= 80) badgeClass = 'score-high';
            else if (res.score >= 60) badgeClass = 'score-med';
            const skillsHtml = res.skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${index + 1}</td>
                <td><strong>${res.name}</strong></td>
                <td><span class="score-badge ${badgeClass}">${res.score}% Match</span></td>
                <td><div class="skills-list">${skillsHtml}</div></td>
                <td>
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size: 0.8rem;">
                        View Profile
                    </button>
                </td>
            `;
            leaderboardBody.appendChild(tr);
        });
        statTotal.innerText = results.length;
        statShortlisted.innerText = shortlistCount;
    }
    //export logic
    document.getElementById('export-btn').addEventListener('click', () => {

    const btn = document.getElementById('export-btn');
    const originalText = btn.innerHTML;

    /* button animation */
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Exporting...';

    /* CSV EXPORT LOGIC */

    const table = document.querySelector("table");
    let csv = [];

    let rows = table.querySelectorAll("tr");

    if(rows.length <= 1){
    csv.push("No candidates available");
    }
    else{

    rows.forEach(row => {

    let cols = row.querySelectorAll("td, th");
    let rowData = [];

    cols.forEach(col => rowData.push(col.innerText));

    csv.push(rowData.join(","));

    });

    }

    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(csvFile);
    downloadLink.download = "shortlisted_candidates.csv";

    downloadLink.click();

    /* success animation */

    setTimeout(() => {

    btn.innerHTML = '<i class="fa-solid fa-check"></i> Exported Successfully!';
    btn.classList.add('score-high');

    setTimeout(() => {
    btn.innerHTML = originalText;
    btn.classList.remove('score-high');
    }, 3000);

    },1500);

    });
    

    const toggleBtn = document.getElementById("themeToggle");

    toggleBtn.addEventListener("click", function(){

        document.body.classList.toggle("dark-mode");

        if(document.body.classList.contains("dark-mode")){
            toggleBtn.innerHTML = "◑";
        }
        else{
            toggleBtn.innerHTML = "◐";
        }

});


    

   


});

import { apiRequest } from "@/lib/queryClient";

export async function loadSeedData() {
  try {
    await apiRequest("POST", "/api/seed");
    return true;
  } catch (error) {
    console.error("Failed to load seed data:", error);
    return false;
  }
}

export async function exportData() {
  try {
    const response = await fetch("/api/export");
    if (!response.ok) throw new Error("Export failed");
    
    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error("Failed to export data:", error);
    return false;
  }
}

export async function importData(file: File) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    await apiRequest("POST", "/api/import", data);
    return true;
  } catch (error) {
    console.error("Failed to import data:", error);
    return false;
  }
}

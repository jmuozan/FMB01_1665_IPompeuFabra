import zipfile
import os
import glob

def extract_and_reassemble(file_pattern, output_file):
    zip_files = sorted(glob.glob(file_pattern), 
                      key=lambda x: int(x.split('part')[-1].split('.')[0]))
    
    if not zip_files:
        print(f"No files matching pattern '{file_pattern}' found.")
        return
    
    print(f"Found {len(zip_files)} zip files to extract.")
    
    with open(output_file, 'wb') as out_f:
        for zip_path in zip_files:
            print(f"Processing {zip_path}...")
            with zipfile.ZipFile(zip_path, 'r') as zf:
                file_names = zf.namelist()
                if not file_names:
                    continue
                with zf.open(file_names[0]) as f:
                    chunk = f.read()
                    out_f.write(chunk)
                    print(f"  Extracted {len(chunk)} bytes")
    
    print(f"Successfully reassembled to {output_file}")

if __name__ == "__main__":
    pattern = input("Enter file pattern (e.g., 'Digitalització_part*.zip'): ")
    output = input("Enter output filename: ")
    extract_and_reassemble(pattern, output)
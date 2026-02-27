#!/usr/bin/env python3
"""
Script to split a PDF into individual page PDFs for the slideshow
"""

import os
import sys
from pathlib import Path

try:
    from PyPDF2 import PdfReader, PdfWriter
except ImportError:
    print("PyPDF2 not found. Installing...")
    os.system("pip3 install PyPDF2")
    from PyPDF2 import PdfReader, PdfWriter

def split_pdf(input_pdf_path, output_dir):
    """Split a PDF into individual page PDFs"""

    # Create output directory if it doesn't exist
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)

    # Read the input PDF
    with open(input_pdf_path, 'rb') as input_file:
        reader = PdfReader(input_file)
        total_pages = len(reader.pages)

        print(f"Splitting {total_pages} pages from {input_pdf_path}")

        # Split each page into a separate PDF
        for page_num in range(total_pages):
            writer = PdfWriter()
            writer.add_page(reader.pages[page_num])

            # Create output filename (1-indexed for easier navigation)
            output_filename = f"slide_{page_num + 1:03d}.pdf"
            output_path = output_dir / output_filename

            # Write the page to a new PDF
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)

            if (page_num + 1) % 10 == 0:
                print(f"Processed {page_num + 1}/{total_pages} pages...")

        print(f"Successfully split PDF into {total_pages} individual files in {output_dir}")
        return total_pages

if __name__ == "__main__":
    # Set paths
    input_pdf = "RA4/RA4.pdf"
    output_directory = "slides"

    # Split the PDF
    try:
        num_slides = split_pdf(input_pdf, output_directory)
        print(f"\nDone! Created {num_slides} slide PDFs in '{output_directory}' directory")
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
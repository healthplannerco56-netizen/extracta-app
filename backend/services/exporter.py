"""Export extraction results to CSV."""
import csv
import io


def export_to_csv(extraction: dict) -> str:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["key", "label", "value", "confidence", "status", "source", "pageNumber"])
    writer.writeheader()
    for field in extraction.get("fields", []):
        writer.writerow(field)
    return output.getvalue()

import os
import sys

# Menambahkan folder apps/api ke sys.path agar modul 'app' bisa ditemukan
# saat menjalankan test dari root direktori monorepo.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import platform
import subprocess
import os

base_dir = os.path.dirname(os.path.abspath(__file__))

print("Escolha seu sistema:")
print("1 - Windows")
print("2 - Linux")

escolha = input("Digite 1 ou 2: ").strip()

if escolha == "1":
    if platform.system() == "Windows":
        print("Executando instalador Windows...")
        subprocess.run(os.path.join(base_dir, "instala_windows.bat"), shell=True)
    else:
        print("Você não está no Windows.")

elif escolha == "2":
    if platform.system() in ["Linux", "Darwin"]:
        print("Preparando script Linux...")

        script_path = os.path.join(base_dir, "instala_linux.sh")

        # 🔥 dá permissão automaticamente
        subprocess.run(["chmod", "+x", script_path])

        print("Executando instalador Linux...")
        subprocess.run(["bash", script_path])
    else:
        print("Você não está no Linux.")

else:
    print("Opção inválida.")
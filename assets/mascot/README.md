# Mascote Cliniq

`cliniq-robot.blend` contém a cena **Cliniq Robot Studio**, materiais, câmera,
iluminação e 48 quadros a 12 fps: aceno articulado, piscar, olhar e flutuação.
O site compartilha o WebP transparente em `RobotAvatar` (LP, login e tutoriais).
É uma animação 3D pré-renderizada, não um visualizador WebGL interativo.
A preferência de movimento reduzido seleciona `robot-still.webp` via `<picture>`.

Para editar, abra o `.blend` no Blender. Para regenerar a partir do script:

```sh
blender --background --python assets/mascot/build_robot.py
blender --background assets/mascot/cliniq-robot.blend --scene 'Cliniq Robot Studio' -a
python3 assets/mascot/export_webp.py
```

O exportador exige Pillow em um ambiente Python externo à aplicação. Os PNGs
intermediários ficam na pasta temporária do sistema, em `cliniq-robot-frames`.
Nenhuma dependência de renderização é necessária no navegador.

A consulta ao MCP Mobbin nesta implementação foi bloqueada pelo requisito de
plano pago; nenhuma referência dele foi utilizada. As animações da LP preservam
a paleta, a tipografia e os componentes existentes.

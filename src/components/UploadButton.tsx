"use client";

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { OurFileRouter } from "../app/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

// A exportação do Uploader foi removida, pois geralmente não é necessária 
// com os componentes gerados, mas pode ser adicionada se precisarmos de um componente totalmente personalizado.
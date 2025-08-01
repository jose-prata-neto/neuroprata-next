import { generateReactHelpers } from "@uploadthing/react"; // Correção: Removido o '/hooks'
import type { OurFileRouter } from "@/app/uploadthing/core";

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();
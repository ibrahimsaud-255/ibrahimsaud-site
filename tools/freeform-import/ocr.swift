import Foundation
import Vision
import AppKit
// يقرأ صوراً (مسارات في الوسائط) ويطبع JSON: [{path,text}] بالتعرّف الضوئي العربي/الإنجليزي
var out:[[String:String]]=[]
for path in CommandLine.arguments.dropFirst(){
  guard let img=NSImage(contentsOfFile:path), let cg=img.cgImage(forProposedRect:nil,context:nil,hints:nil) else{out.append(["path":path,"text":""]);continue}
  let req=VNRecognizeTextRequest()
  req.recognitionLevel = .accurate
  req.recognitionLanguages=["ar-SA","en-US"]
  req.usesLanguageCorrection=true
  try? VNImageRequestHandler(cgImage:cg,options:[:]).perform([req])
  let obs=(req.results ?? []).sorted{ $0.boundingBox.maxY > $1.boundingBox.maxY }
  let t=obs.compactMap{ $0.topCandidates(1).first?.string }.joined(separator:"\n")
  out.append(["path":path,"text":t])
}
let d=try! JSONSerialization.data(withJSONObject:out,options:[])
print(String(data:d,encoding:.utf8)!)

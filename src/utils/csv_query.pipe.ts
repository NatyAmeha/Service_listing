import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";

@Injectable()
export class CSVQueryPipe implements PipeTransform<String ,String[]> {
    transform(value: String, metadata: ArgumentMetadata) : String[]{
         var stringArrayResult = value.split(",")
         return stringArrayResult
    }
}
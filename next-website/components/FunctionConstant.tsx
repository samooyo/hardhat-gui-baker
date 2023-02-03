import { ContractAbi } from "./ContractContext";
import { Contract } from "ethers";
import { ParamType } from "ethers/src.ts/utils";
import { useContractRead } from "wagmi";
import {
  ExtractAbiFunctions,
  ExtractAbiFunction,
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunctionNames,
  Abi,
} from "abitype";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { RxCross2 } from "react-icons/rx";
import {
  getParsedEthersError,
  ReturnValue,
} from "@enzoferey/ethers-error-parser";
import ErrorMessage from "./ErrorMessage";
import SuccessMessage from "./SuccessMessage";

export type ExtractAbiFunctionParams<
  TAbi extends Abi,
  TMethod extends ExtractAbiFunctionNames<TAbi>
> = AbiParametersToPrimitiveTypes<ExtractAbiFunction<TAbi, TMethod>["inputs"]>;

type Props = {
  contract: Contract;
  functionName: ExtractAbiFunctions<typeof ContractAbi, "view">["name"];
};

function displayName(arg: ParamType) {
  if (!arg.name) return arg.type;
  return `${arg.name} (${arg.type})`;
}

function FunctionConstant({ contract, functionName }: Props) {
  type Result2 = ExtractAbiFunctionParams<
    typeof ContractAbi,
    typeof functionName
  >;
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const nbArgs = contract.interface.functions[functionName].inputs.length;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Record<string, Result2>>();

  // TODO : change to func
  const onSubmit = (data: any) => {
    console.log(data);
    refetch();
  };

  const { data, refetch } = useContractRead({
    address: contract.address,
    abi: ContractAbi,
    functionName: functionName,
    enabled: false,
    args: Object.values(watch()) as any,
    onSuccess(data) {
      setResult(data.toString());
    },
    onError(error) {
      const parsedEthersError = getParsedEthersError(error);
      setError(parsedEthersError.errorCode + ": " + parsedEthersError.context);
    },
  });

  return (
    <div className="mb-5 grid grid-cols-12">
      <div className="mt-3 col-span-11">
        <h3 className={`${!nbArgs ? "inline" : ""} mr-4`}>
          {functionName.slice(0, functionName.indexOf("("))}
        </h3>
        <div className="grid grid-cols-2 ">
          {contract.interface.functions[functionName].inputs.map((arg, i) => {
            return (
              <input
                className="input input-secondary input-md h-8 border-2 mt-1 mr-4"
                key={arg.name}
                placeholder={displayName(arg)}
                {...register(arg.name)}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col justify-end">
        <button
          className="min-h-8 w-14 btn btn-outline input-info input-xs border-2 h-6"
          onClick={handleSubmit(onSubmit)}
        >
          Read
        </button>
      </div>

      <SuccessMessage message={result} setResult={setResult} />
      <ErrorMessage message={error} setError={setError} />
    </div>
  );
}

export default FunctionConstant;

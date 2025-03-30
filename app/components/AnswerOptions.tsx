import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Check, X } from "lucide-react-native";

type Option = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type AnswerOptionsProps = {
  options: Option[];
  onAnswerSelected?: (optionId: string) => void;
  onCheckAnswer?: (optionId: string, isCorrect: boolean) => void;
  showExplanation?: boolean;
  explanation?: string;
  selectedOption?: string | null;
  disabled?: boolean;
};

const AnswerOptions = ({
  options = [
    { id: "A", text: "First law of thermodynamics", isCorrect: true },
    { id: "B", text: "Second law of thermodynamics", isCorrect: false },
    { id: "C", text: "Third law of thermodynamics", isCorrect: false },
    { id: "D", text: "Zeroth law of thermodynamics", isCorrect: false },
  ],
  onAnswerSelected = () => {},
  onCheckAnswer,
  showExplanation = false,
  explanation = "The first law of thermodynamics states that energy cannot be created or destroyed in an isolated system. It is a version of the law of conservation of energy.",
  selectedOption = null,
  disabled = false,
}: AnswerOptionsProps) => {
  const [localSelectedOption, setLocalSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  
  useEffect(() => {
    setLocalSelectedOption(selectedOption);
    if (selectedOption === null) {
      setIsAnswerChecked(false);
    }
  }, [selectedOption]);

  const handleOptionSelect = (optionId: string) => {
    if (!isAnswerChecked && !disabled) {
      setLocalSelectedOption(optionId);
      onAnswerSelected?.(optionId);
    }
  };

  const handleCheckAnswer = () => {
    if (localSelectedOption) {
      const selectedOptionObj = options.find(
        (option) => option.id === localSelectedOption,
      );
      if (selectedOptionObj) {
        if (onCheckAnswer) {
          onCheckAnswer(localSelectedOption, selectedOptionObj.isCorrect);
        } else {
          console.warn("onCheckAnswer prop is missing - using deprecated behavior");
          // @ts-ignore - for backward compatibility
          onAnswerSelected?.(localSelectedOption, selectedOptionObj.isCorrect);
        }
        setIsAnswerChecked(true);
      }
    }
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-sm w-full">
      <ScrollView className="mb-4">
        {options.map((option) => {
          const isSelected = localSelectedOption === option.id;
          const showResult = isAnswerChecked;

          let bgColorClass = "bg-gray-100";
          if (showResult) {
            bgColorClass = option.isCorrect
              ? "bg-green-100"
              : isSelected
                ? "bg-red-100"
                : "bg-gray-100";
          } else if (isSelected) {
            bgColorClass = "bg-blue-100";
          }

          return (
            <TouchableOpacity
              key={option.id}
              className={`flex-row items-center p-3 rounded-md mb-2 ${bgColorClass}`}
              onPress={() => handleOptionSelect(option.id)}
              disabled={isAnswerChecked || disabled}
            >
              <View className="w-8 h-8 rounded-full bg-white items-center justify-center mr-3 border border-gray-300">
                <Text className="text-gray-700 font-medium">{option.id}</Text>
              </View>
              <Text className="flex-1 text-gray-800 text-base">
                {option.text}
              </Text>
              {showResult && option.isCorrect && (
                <Check size={20} color="#22c55e" />
              )}
              {showResult && !option.isCorrect && isSelected && (
                <X size={20} color="#ef4444" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {showExplanation && isAnswerChecked && (
        <View className="bg-blue-50 p-3 rounded-md mb-4">
          <Text className="font-medium text-blue-800 mb-1">Explanation:</Text>
          <Text className="text-blue-700">{explanation}</Text>
        </View>
      )}

      <TouchableOpacity
        className={`py-3 rounded-md items-center justify-center ${isAnswerChecked || !localSelectedOption ? "bg-gray-400" : "bg-blue-500"}`}
        onPress={handleCheckAnswer}
        disabled={isAnswerChecked || !localSelectedOption || disabled}
      >
        <Text className="text-white font-medium text-base">
          {isAnswerChecked ? "Answer Checked" : "Check Answer"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AnswerOptions;

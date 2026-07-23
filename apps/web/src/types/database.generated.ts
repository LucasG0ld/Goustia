export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      allergens: {
        Row: {
          code: string;
          created_at: string;
          eu_mandatory: boolean;
          id: string;
          name_fr: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          eu_mandatory?: boolean;
          id?: string;
          name_fr: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          eu_mandatory?: boolean;
          id?: string;
          name_fr?: string;
        };
        Relationships: [];
      };
      budget_preferences: {
        Row: {
          created_at: string;
          level: Database["public"]["Enums"]["budget_level"];
          max_cost_per_serving_eur: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          level: Database["public"]["Enums"]["budget_level"];
          max_cost_per_serving_eur?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          level?: Database["public"]["Enums"]["budget_level"];
          max_cost_per_serving_eur?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      cuisine_preferences: {
        Row: {
          created_at: string;
          cuisine_code: string;
          learned_from: string;
          signal: Database["public"]["Enums"]["preference_signal"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          cuisine_code: string;
          learned_from?: string;
          signal: Database["public"]["Enums"]["preference_signal"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          cuisine_code?: string;
          learned_from?: string;
          signal?: Database["public"]["Enums"]["preference_signal"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cuisine_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      culinary_preferences: {
        Row: {
          cooking_skill: Database["public"]["Enums"]["cooking_skill"] | null;
          created_at: string;
          dietary_pattern:
            | Database["public"]["Enums"]["dietary_pattern"]
            | null;
          other_diet_label: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cooking_skill?: Database["public"]["Enums"]["cooking_skill"] | null;
          created_at?: string;
          dietary_pattern?:
            | Database["public"]["Enums"]["dietary_pattern"]
            | null;
          other_diet_label?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cooking_skill?: Database["public"]["Enums"]["cooking_skill"] | null;
          created_at?: string;
          dietary_pattern?:
            | Database["public"]["Enums"]["dietary_pattern"]
            | null;
          other_diet_label?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "culinary_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      duration_preferences: {
        Row: {
          created_at: string;
          max_cooking_minutes: number | null;
          max_preparation_minutes: number | null;
          max_total_minutes: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          max_cooking_minutes?: number | null;
          max_preparation_minutes?: number | null;
          max_total_minutes?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          max_cooking_minutes?: number | null;
          max_preparation_minutes?: number | null;
          max_total_minutes?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "duration_preferences_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      equipment: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          name_fr: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          name_fr: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          name_fr?: string;
        };
        Relationships: [];
      };
      ingredient_allergens: {
        Row: {
          allergen_id: string;
          created_at: string;
          ingredient_id: string;
          relation: string;
        };
        Insert: {
          allergen_id: string;
          created_at?: string;
          ingredient_id: string;
          relation?: string;
        };
        Update: {
          allergen_id?: string;
          created_at?: string;
          ingredient_id?: string;
          relation?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_allergens_allergen_id_fkey";
            columns: ["allergen_id"];
            isOneToOne: false;
            referencedRelation: "allergens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredient_allergens_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredient_families: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          name_fr: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          name_fr: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          name_fr?: string;
        };
        Relationships: [];
      };
      ingredient_relations: {
        Row: {
          child_ingredient_id: string;
          created_at: string;
          kind: Database["public"]["Enums"]["ingredient_relation_kind"];
          parent_ingredient_id: string;
        };
        Insert: {
          child_ingredient_id: string;
          created_at?: string;
          kind: Database["public"]["Enums"]["ingredient_relation_kind"];
          parent_ingredient_id: string;
        };
        Update: {
          child_ingredient_id?: string;
          created_at?: string;
          kind?: Database["public"]["Enums"]["ingredient_relation_kind"];
          parent_ingredient_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_relations_child_ingredient_id_fkey";
            columns: ["child_ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredient_relations_parent_ingredient_id_fkey";
            columns: ["parent_ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredient_synonyms: {
        Row: {
          created_at: string;
          id: string;
          ingredient_id: string;
          name_fr: string;
          search_name: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ingredient_id: string;
          name_fr: string;
          search_name?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          ingredient_id?: string;
          name_fr?: string;
          search_name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "ingredient_synonyms_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredients: {
        Row: {
          ciqual_code: string | null;
          contains_alcohol: boolean;
          created_at: string;
          family_id: string | null;
          id: string;
          is_active: boolean;
          name_fr: string;
          parent_ingredient_id: string | null;
          search_name: string | null;
          slug: string;
          updated_at: string;
        };
        Insert: {
          ciqual_code?: string | null;
          contains_alcohol?: boolean;
          created_at?: string;
          family_id?: string | null;
          id?: string;
          is_active?: boolean;
          name_fr: string;
          parent_ingredient_id?: string | null;
          search_name?: string | null;
          slug: string;
          updated_at?: string;
        };
        Update: {
          ciqual_code?: string | null;
          contains_alcohol?: boolean;
          created_at?: string;
          family_id?: string | null;
          id?: string;
          is_active?: boolean;
          name_fr?: string;
          parent_ingredient_id?: string | null;
          search_name?: string | null;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ingredients_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "ingredient_families";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredients_parent_ingredient_id_fkey";
            columns: ["parent_ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          birth_date: string;
          country_code: string;
          created_at: string;
          first_name: string;
          id: string;
          last_name: string;
          meals_per_week: number;
          nutrition_goal: Database["public"]["Enums"]["nutrition_goal"];
          onboarding_completed_at: string | null;
          onboarding_status: Database["public"]["Enums"]["onboarding_status"];
          servings_per_meal: number;
          updated_at: string;
        };
        Insert: {
          birth_date: string;
          country_code?: string;
          created_at?: string;
          first_name: string;
          id: string;
          last_name: string;
          meals_per_week?: number;
          nutrition_goal?: Database["public"]["Enums"]["nutrition_goal"];
          onboarding_completed_at?: string | null;
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"];
          servings_per_meal?: number;
          updated_at?: string;
        };
        Update: {
          birth_date?: string;
          country_code?: string;
          created_at?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          meals_per_week?: number;
          nutrition_goal?: Database["public"]["Enums"]["nutrition_goal"];
          onboarding_completed_at?: string | null;
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"];
          servings_per_meal?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      recipe_categories: {
        Row: {
          created_at: string;
          id: string;
          name_fr: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name_fr: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name_fr?: string;
          slug?: string;
        };
        Relationships: [];
      };
      recipe_category_assignments: {
        Row: {
          category_id: string;
          recipe_id: string;
        };
        Insert: {
          category_id: string;
          recipe_id: string;
        };
        Update: {
          category_id?: string;
          recipe_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_category_assignments_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "recipe_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_category_assignments_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_images: {
        Row: {
          alt_text: string | null;
          created_at: string;
          failure_code: string | null;
          height: number | null;
          id: string;
          is_primary: boolean;
          model: string | null;
          prompt_version: string | null;
          provider: string | null;
          recipe_version_id: string;
          status: Database["public"]["Enums"]["recipe_image_status"];
          storage_bucket: string;
          storage_path: string | null;
          updated_at: string;
          width: number | null;
        };
        Insert: {
          alt_text?: string | null;
          created_at?: string;
          failure_code?: string | null;
          height?: number | null;
          id?: string;
          is_primary?: boolean;
          model?: string | null;
          prompt_version?: string | null;
          provider?: string | null;
          recipe_version_id: string;
          status?: Database["public"]["Enums"]["recipe_image_status"];
          storage_bucket?: string;
          storage_path?: string | null;
          updated_at?: string;
          width?: number | null;
        };
        Update: {
          alt_text?: string | null;
          created_at?: string;
          failure_code?: string | null;
          height?: number | null;
          id?: string;
          is_primary?: boolean;
          model?: string | null;
          prompt_version?: string | null;
          provider?: string | null;
          recipe_version_id?: string;
          status?: Database["public"]["Enums"]["recipe_image_status"];
          storage_bucket?: string;
          storage_path?: string | null;
          updated_at?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_images_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_ingredients: {
        Row: {
          created_at: string;
          id: string;
          ingredient_id: string;
          optional: boolean;
          position: number;
          preparation_note: string | null;
          quantity: number | null;
          recipe_version_id: string;
          unit: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ingredient_id: string;
          optional?: boolean;
          position: number;
          preparation_note?: string | null;
          quantity?: number | null;
          recipe_version_id: string;
          unit?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          ingredient_id?: string;
          optional?: boolean;
          position?: number;
          preparation_note?: string | null;
          quantity?: number | null;
          recipe_version_id?: string;
          unit?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_nutrition: {
        Row: {
          calculated_at: string;
          calories_kcal: number;
          carbohydrates_g: number;
          created_at: string;
          fat_g: number;
          fiber_g: number | null;
          protein_g: number;
          recipe_version_id: string;
          salt_g: number | null;
          source: string;
          source_version: string;
          tolerance_percent: number;
          updated_at: string;
        };
        Insert: {
          calculated_at?: string;
          calories_kcal: number;
          carbohydrates_g: number;
          created_at?: string;
          fat_g: number;
          fiber_g?: number | null;
          protein_g: number;
          recipe_version_id: string;
          salt_g?: number | null;
          source?: string;
          source_version: string;
          tolerance_percent?: number;
          updated_at?: string;
        };
        Update: {
          calculated_at?: string;
          calories_kcal?: number;
          carbohydrates_g?: number;
          created_at?: string;
          fat_g?: number;
          fiber_g?: number | null;
          protein_g?: number;
          recipe_version_id?: string;
          salt_g?: number | null;
          source?: string;
          source_version?: string;
          tolerance_percent?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_nutrition_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: true;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_steps: {
        Row: {
          created_at: string;
          id: string;
          instruction: string;
          position: number;
          recipe_version_id: string;
          timer_seconds: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          instruction: string;
          position: number;
          recipe_version_id: string;
          timer_seconds?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          instruction?: string;
          position?: number;
          recipe_version_id?: string;
          timer_seconds?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_steps_recipe_version_id_fkey";
            columns: ["recipe_version_id"];
            isOneToOne: false;
            referencedRelation: "recipe_versions";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_tag_assignments: {
        Row: {
          recipe_id: string;
          tag_id: string;
        };
        Insert: {
          recipe_id: string;
          tag_id: string;
        };
        Update: {
          recipe_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_tag_assignments_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recipe_tag_assignments_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "recipe_tags";
            referencedColumns: ["id"];
          },
        ];
      };
      recipe_tags: {
        Row: {
          created_at: string;
          id: string;
          name_fr: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name_fr: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name_fr?: string;
          slug?: string;
        };
        Relationships: [];
      };
      recipe_versions: {
        Row: {
          ai_model: string | null;
          ai_provider: string | null;
          cooking_minutes: number;
          cost_level: Database["public"]["Enums"]["recipe_cost_level"] | null;
          created_at: string;
          description: string;
          difficulty: Database["public"]["Enums"]["recipe_difficulty"];
          estimated_cost_eur: number | null;
          id: string;
          origin: Database["public"]["Enums"]["recipe_origin"];
          preparation_minutes: number;
          prompt_version: string | null;
          publication_status: Database["public"]["Enums"]["recipe_publication_status"];
          published_at: string | null;
          recipe_id: string;
          resting_minutes: number;
          servings: number;
          title: string;
          updated_at: string;
          validated_at: string | null;
          validation_notes: string | null;
          validation_status: Database["public"]["Enums"]["recipe_validation_status"];
          version_number: number;
        };
        Insert: {
          ai_model?: string | null;
          ai_provider?: string | null;
          cooking_minutes: number;
          cost_level?: Database["public"]["Enums"]["recipe_cost_level"] | null;
          created_at?: string;
          description: string;
          difficulty: Database["public"]["Enums"]["recipe_difficulty"];
          estimated_cost_eur?: number | null;
          id?: string;
          origin: Database["public"]["Enums"]["recipe_origin"];
          preparation_minutes: number;
          prompt_version?: string | null;
          publication_status?: Database["public"]["Enums"]["recipe_publication_status"];
          published_at?: string | null;
          recipe_id: string;
          resting_minutes?: number;
          servings: number;
          title: string;
          updated_at?: string;
          validated_at?: string | null;
          validation_notes?: string | null;
          validation_status?: Database["public"]["Enums"]["recipe_validation_status"];
          version_number: number;
        };
        Update: {
          ai_model?: string | null;
          ai_provider?: string | null;
          cooking_minutes?: number;
          cost_level?: Database["public"]["Enums"]["recipe_cost_level"] | null;
          created_at?: string;
          description?: string;
          difficulty?: Database["public"]["Enums"]["recipe_difficulty"];
          estimated_cost_eur?: number | null;
          id?: string;
          origin?: Database["public"]["Enums"]["recipe_origin"];
          preparation_minutes?: number;
          prompt_version?: string | null;
          publication_status?: Database["public"]["Enums"]["recipe_publication_status"];
          published_at?: string | null;
          recipe_id?: string;
          resting_minutes?: number;
          servings?: number;
          title?: string;
          updated_at?: string;
          validated_at?: string | null;
          validation_notes?: string | null;
          validation_status?: Database["public"]["Enums"]["recipe_validation_status"];
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: "recipe_versions_recipe_id_fkey";
            columns: ["recipe_id"];
            isOneToOne: false;
            referencedRelation: "recipes";
            referencedColumns: ["id"];
          },
        ];
      };
      recipes: {
        Row: {
          canonical_slug: string;
          created_at: string;
          created_by: string | null;
          deduplication_hash: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          canonical_slug: string;
          created_at?: string;
          created_by?: string | null;
          deduplication_hash: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          canonical_slug?: string;
          created_at?: string;
          created_by?: string | null;
          deduplication_hash?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_equipment: {
        Row: {
          available: boolean;
          created_at: string;
          equipment_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          available?: boolean;
          created_at?: string;
          equipment_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          available?: boolean;
          created_at?: string;
          equipment_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_equipment_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipment";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_equipment_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_food_constraints: {
        Row: {
          allergen_id: string | null;
          created_at: string;
          id: string;
          ingredient_id: string | null;
          is_absolute: boolean;
          kind: Database["public"]["Enums"]["food_constraint_kind"];
          note: string | null;
          severity: Database["public"]["Enums"]["constraint_severity"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          allergen_id?: string | null;
          created_at?: string;
          id?: string;
          ingredient_id?: string | null;
          is_absolute: boolean;
          kind: Database["public"]["Enums"]["food_constraint_kind"];
          note?: string | null;
          severity?: Database["public"]["Enums"]["constraint_severity"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          allergen_id?: string | null;
          created_at?: string;
          id?: string;
          ingredient_id?: string | null;
          is_absolute?: boolean;
          kind?: Database["public"]["Enums"]["food_constraint_kind"];
          note?: string | null;
          severity?: Database["public"]["Enums"]["constraint_severity"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_food_constraints_allergen_id_fkey";
            columns: ["allergen_id"];
            isOneToOne: false;
            referencedRelation: "allergens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_food_constraints_ingredient_id_fkey";
            columns: ["ingredient_id"];
            isOneToOne: false;
            referencedRelation: "ingredients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_food_constraints_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      normalize_search_term: { Args: { value: string }; Returns: string };
    };
    Enums: {
      budget_level: "low" | "moderate" | "flexible";
      constraint_severity:
        | "none"
        | "mild"
        | "moderate"
        | "severe"
        | "life_threatening";
      cooking_skill: "beginner" | "intermediate" | "advanced";
      dietary_pattern:
        | "omnivore"
        | "vegetarian"
        | "vegan"
        | "pescatarian"
        | "pork_free"
        | "other";
      food_constraint_kind:
        | "allergy"
        | "intolerance"
        | "strict_exclusion"
        | "negative_preference";
      ingredient_relation_kind: "derived_from" | "contains";
      nutrition_goal:
        | "weight_loss"
        | "balanced"
        | "muscle_gain"
        | "no_specific_goal";
      onboarding_status:
        | "account_created"
        | "food_safety_completed"
        | "goals_completed"
        | "initial_tastes_completed"
        | "completed";
      preference_signal: "liked" | "disliked";
      recipe_cost_level: "low" | "moderate" | "high";
      recipe_difficulty: "easy" | "medium" | "advanced";
      recipe_image_status:
        | "pending"
        | "generating"
        | "ready"
        | "failed"
        | "rejected";
      recipe_origin: "editorial" | "ai_generated" | "user";
      recipe_publication_status:
        | "private"
        | "unlisted"
        | "published"
        | "archived";
      recipe_validation_status: "draft" | "pending" | "validated" | "rejected";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      budget_level: ["low", "moderate", "flexible"],
      constraint_severity: [
        "none",
        "mild",
        "moderate",
        "severe",
        "life_threatening",
      ],
      cooking_skill: ["beginner", "intermediate", "advanced"],
      dietary_pattern: [
        "omnivore",
        "vegetarian",
        "vegan",
        "pescatarian",
        "pork_free",
        "other",
      ],
      food_constraint_kind: [
        "allergy",
        "intolerance",
        "strict_exclusion",
        "negative_preference",
      ],
      ingredient_relation_kind: ["derived_from", "contains"],
      nutrition_goal: [
        "weight_loss",
        "balanced",
        "muscle_gain",
        "no_specific_goal",
      ],
      onboarding_status: [
        "account_created",
        "food_safety_completed",
        "goals_completed",
        "initial_tastes_completed",
        "completed",
      ],
      preference_signal: ["liked", "disliked"],
      recipe_cost_level: ["low", "moderate", "high"],
      recipe_difficulty: ["easy", "medium", "advanced"],
      recipe_image_status: [
        "pending",
        "generating",
        "ready",
        "failed",
        "rejected",
      ],
      recipe_origin: ["editorial", "ai_generated", "user"],
      recipe_publication_status: [
        "private",
        "unlisted",
        "published",
        "archived",
      ],
      recipe_validation_status: ["draft", "pending", "validated", "rejected"],
    },
  },
} as const;
